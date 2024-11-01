/*
 * Author: Nong Hoang Vu || JavaTech
 * Facebook:https://facebook.com/NongHoangVu04
 * Github: https://github.com/JavaTech04
 * Youtube: https://www.youtube.com/@javatech04/?sub_confirmation=1
 */
package sd79.service;

import io.micrometer.common.util.StringUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.InvalidDataAccessApiUsageException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import sd79.dto.requests.authRequests.SignInRequest;
import sd79.dto.response.auth.TokenResponse;
import sd79.exception.InvalidDataException;
import sd79.model.User;
import sd79.model.redis_model.Token;
import sd79.repositories.auth.UserRepository;

import static org.springframework.http.HttpHeaders.AUTHORIZATION;
import static sd79.enums.TokenType.ACCESS_TOKEN;
import static sd79.enums.TokenType.REFRESH_TOKEN;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;

    private final AuthenticationManager authenticationManager;

    private final JwtService jwtService;

    private final TokenService tokenService;

    public TokenResponse authenticate(SignInRequest signInRequest) {
        this.authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(signInRequest.getUsername(), signInRequest.getPassword()));
        var user = this.userRepository.findUserByUsernameOrEmailIgnoreCase(signInRequest.getUsername())
                .filter(u -> u.getUsername().equals(signInRequest.getUsername()) || u.getEmail().equals(signInRequest.getUsername()))
                .orElseThrow(() -> new UsernameNotFoundException("Username or password incorrect"));

        String access_token = this.jwtService.generateToken(user);
        String refresh_token = this.jwtService.generateRefreshToken(user);

        this.tokenService.saveToken(Token.builder()
                .id(user.getUsername())
                .accessToken(access_token)
                .refreshToken(refresh_token)
                .build());
        return TokenResponse.builder()
                .accessToken(access_token)
                .refreshToken(refresh_token)
                .userId(user.getId())
                .authority(user.getRole().getName())
                .build();
    }

    public TokenResponse refresh(HttpServletRequest request) {
        String refresh_token = request.getHeader("AUTHORIZATION_REFRESH_TOKEN");
        if (StringUtils.isBlank(refresh_token)) {
            throw new InvalidDataException("Token must be not blank!");
        }
        final String username = this.jwtService.extractUsername(refresh_token, REFRESH_TOKEN);
        User user = this.userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("Username not found"));
        String access_token = this.jwtService.generateToken(user);
        this.tokenService.saveToken(Token.builder()
                .id(user.getUsername())
                .accessToken(access_token)
                .refreshToken(refresh_token)
                .build());
        return TokenResponse.builder()
                .accessToken(access_token)
                .refreshToken(refresh_token)
                .userId(user.getId())
                .build();
    }

    public void logout(HttpServletRequest request) {
        String authorization = request.getHeader(AUTHORIZATION);
        if (StringUtils.isBlank(authorization)) {
            throw new InvalidDataAccessApiUsageException("Token must be not blank!");
        }
        try {
            String username = this.jwtService.extractUsername(authorization, ACCESS_TOKEN);
            this.tokenService.deleteToken(username);
            log.info("========== logout successfully ==========");
        } catch (Exception e) {
            log.error("The account was logged out with an error={}", e.getMessage());
        }

    }
}

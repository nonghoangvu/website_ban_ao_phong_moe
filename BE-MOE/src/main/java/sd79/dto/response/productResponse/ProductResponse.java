/*
 * Author: Nong Hoang Vu || JavaTech
 * Facebook:https://facebook.com/NongHoangVu04
 * Github: https://github.com/JavaTech04
 * Youtube: https://www.youtube.com/@javatech04/?sub_confirmation=1
 */
package sd79.dto.response.productResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import sd79.enums.ProductStatus;

import java.util.Date;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private List<String> imageUrl;
    private String name;
    private String description;
    private ProductStatus status;
    private String category;
    private String brand;
    private String material;
    private String origin;
    private Date createdAt;
    private Date updatedAt;
    private String createdBy;
    private String updatedBy;
    private int productQuantity;
}

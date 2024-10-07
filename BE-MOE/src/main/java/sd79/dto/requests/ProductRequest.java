package sd79.dto.requests;

import lombok.Builder;
import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;
import sd79.enums.ProductStatus;

import java.util.Set;

@Getter
@Builder
public class ProductRequest {
    //Product
    private String name;
    private String description;
    private ProductStatus status;
    private int categoryId;
    private int brandId;
    private int materialId;
    private String origin;
    private MultipartFile[] images;
    //Product detail
    private Set<ProductDetailRequest> productDetails;
    //Created by
    private long userId;
}

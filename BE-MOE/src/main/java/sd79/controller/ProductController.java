package sd79.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import sd79.dto.requests.ProductImageReq;
import sd79.dto.requests.ProductRequest;
import sd79.dto.response.ResponseData;
import sd79.enums.ProductStatus;
import sd79.service.ProductService;

@Slf4j
@RestController
@RequestMapping("api/${api.version}/product")
@Tag(name = "Product Controller", description = "Product and product management details")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @Operation(
            summary = "Get all product listings",
            description = "Get the entire product list (updating search and pagination functions)"
    )
    @GetMapping
    public ResponseData<?> getAllProducts(
            @RequestParam(value = "pageNo", defaultValue = "1") int pageNo,
            @RequestParam(value = "pageSize", defaultValue = "3") int pageSize,
            @RequestParam(value = "keyword", defaultValue = "") String keyword,
            @RequestParam(value = "status", defaultValue = "ACTIVE") ProductStatus status
    ) {
        return new ResponseData<>(HttpStatus.OK.value(), "Successfully retrieved product list", this.productService.getAllProducts(pageNo, pageSize, keyword, status));
    }

    @Operation(
            summary = "Create Product",
            description = "Add a product into database"
    )
    @PostMapping
    public ResponseData<?> storeProduct(@RequestBody ProductRequest request) {
        return new ResponseData<>(HttpStatus.CREATED.value(), "Successfully added product to the database", this.productService.storeProduct(request));
    }

    @PostMapping("/upload")
    public ResponseData<?> uploadFile(@ModelAttribute ProductImageReq request) {
        this.productService.storeProductImages(request);
        return new ResponseData<>(HttpStatus.CREATED.value(), "Successfully added product images");
    }
}
    
package com.ecommerce.api.config;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.ecommerce.api.entity.Category;
import com.ecommerce.api.entity.Product;
import com.ecommerce.api.repository.CategoryRepository;
import com.ecommerce.api.repository.ProductRepository;

/** Seeds a starter catalog without overwriting or duplicating existing products. */
@Configuration
public class ProductCatalogInitializer {

    private record ProductSeed(String name, String brand, double price,
            double rating, int quantity, String category) {}

    @Bean
    CommandLineRunner seedProductCatalog(
            ProductRepository productRepository,
            CategoryRepository categoryRepository) {

        return args -> {
            List<String> categoryNames = List.of(
                    "Electronics", "Computers", "Mobiles",
                    "Accessories", "Home Appliances");

            Map<String, Category> categories = categoryRepository.findAll()
                    .stream()
                    .collect(Collectors.toMap(
                            c -> c.getName().toLowerCase(),
                            Function.identity(),
                            (first, second) -> first));

            for (String name : categoryNames) {
                if (!categories.containsKey(name.toLowerCase())) {
                    Category category = new Category();
                    category.setName(name);
                    category.setDescription(name + " and related products");
                    category = categoryRepository.save(category);
                    categories.put(name.toLowerCase(), category);
                }
            }

            List<ProductSeed> seeds = List.of(
                new ProductSeed("Dell Inspiron 15", "Dell", 55000, 4.4, 55, "Computers"),
                new ProductSeed("HP Pavilion 15", "HP", 62999, 4.3, 32, "Computers"),
                new ProductSeed("Lenovo IdeaPad Slim 5", "Lenovo", 68990, 4.5, 28, "Computers"),
                new ProductSeed("ASUS VivoBook 15", "ASUS", 48990, 4.2, 40, "Computers"),
                new ProductSeed("Acer Aspire 7", "Acer", 57990, 4.1, 22, "Computers"),
                new ProductSeed("Apple MacBook Air M2", "Apple", 89900, 4.8, 18, "Computers"),
                new ProductSeed("Lenovo ThinkPad E14", "Lenovo", 74990, 4.6, 15, "Computers"),
                new ProductSeed("HP 15s Laptop", "HP", 42990, 4.0, 35, "Computers"),
                new ProductSeed("ASUS TUF Gaming F15", "ASUS", 84990, 4.5, 12, "Computers"),
                new ProductSeed("Acer Nitro V Gaming", "Acer", 79990, 4.4, 14, "Computers"),

                new ProductSeed("Samsung Galaxy S24 FE", "Samsung", 54999, 4.5, 30, "Mobiles"),
                new ProductSeed("Apple iPhone 15", "Apple", 59900, 4.7, 25, "Mobiles"),
                new ProductSeed("OnePlus 12R", "OnePlus", 39999, 4.5, 26, "Mobiles"),
                new ProductSeed("Google Pixel 8a", "Google", 39999, 4.4, 19, "Mobiles"),
                new ProductSeed("Nothing Phone 2a", "Nothing", 23999, 4.3, 42, "Mobiles"),
                new ProductSeed("Redmi Note 13 Pro", "Xiaomi", 24999, 4.2, 38, "Mobiles"),
                new ProductSeed("Samsung Galaxy A35", "Samsung", 28999, 4.2, 24, "Mobiles"),
                new ProductSeed("Motorola Edge 50 Fusion", "Motorola", 22999, 4.3, 31, "Mobiles"),
                new ProductSeed("iPhone 14", "Apple", 49900, 4.6, 16, "Mobiles"),
                new ProductSeed("OnePlus Nord CE4", "OnePlus", 24999, 4.2, 29, "Mobiles"),

                new ProductSeed("Sony WH-1000XM5 Headphones", "Sony", 24990, 4.8, 20, "Accessories"),
                new ProductSeed("JBL Tune 770NC", "JBL", 6999, 4.4, 45, "Accessories"),
                new ProductSeed("boAt Airdopes 141", "boAt", 1299, 4.1, 80, "Accessories"),
                new ProductSeed("Apple AirPods Pro 2", "Apple", 24900, 4.7, 17, "Accessories"),
                new ProductSeed("Logitech MX Master 3S", "Logitech", 9995, 4.7, 21, "Accessories"),
                new ProductSeed("Logitech K380 Keyboard", "Logitech", 2995, 4.4, 33, "Accessories"),
                new ProductSeed("Samsung 25W USB-C Charger", "Samsung", 1299, 4.3, 60, "Accessories"),
                new ProductSeed("Anker PowerCore 20000", "Anker", 3999, 4.5, 27, "Accessories"),
                new ProductSeed("SanDisk Ultra 128GB USB Drive", "SanDisk", 999, 4.2, 70, "Accessories"),
                new ProductSeed("TP-Link Archer AX23 Router", "TP-Link", 4499, 4.3, 23, "Accessories"),

                new ProductSeed("Samsung 43-inch 4K Smart TV", "Samsung", 32999, 4.5, 14, "Electronics"),
                new ProductSeed("LG 55-inch 4K UHD TV", "LG", 48990, 4.6, 11, "Electronics"),
                new ProductSeed("Sony Bravia 50-inch 4K TV", "Sony", 57990, 4.7, 9, "Electronics"),
                new ProductSeed("Xiaomi 32-inch Smart TV", "Xiaomi", 13999, 4.2, 20, "Electronics"),
                new ProductSeed("Amazon Fire TV Stick 4K", "Amazon", 5999, 4.5, 34, "Electronics"),
                new ProductSeed("Canon EOS 1500D DSLR", "Canon", 38999, 4.4, 8, "Electronics"),
                new ProductSeed("GoPro HERO12 Black", "GoPro", 34990, 4.6, 7, "Electronics"),
                new ProductSeed("Epson EcoTank L3250 Printer", "Epson", 15999, 4.3, 13, "Electronics"),
                new ProductSeed("Portronics Beem 430 Projector", "Portronics", 8999, 4.0, 10, "Electronics"),
                new ProductSeed("BenQ GW2790 Monitor", "BenQ", 11990, 4.4, 16, "Electronics"),

                new ProductSeed("Philips Air Fryer 4.1L", "Philips", 8999, 4.5, 18, "Home Appliances"),
                new ProductSeed("Prestige 1.5L Electric Kettle", "Prestige", 1299, 4.2, 40, "Home Appliances"),
                new ProductSeed("Bajaj 750W Mixer Grinder", "Bajaj", 3499, 4.3, 25, "Home Appliances"),
                new ProductSeed("LG Frost-Free Double Door Refrigerator", "LG", 32990, 4.5, 9, "Home Appliances"),
                new ProductSeed("Whirlpool 7kg Washing Machine", "Whirlpool", 18990, 4.4, 12, "Home Appliances"),
                new ProductSeed("Dyson V8 Cordless Vacuum", "Dyson", 28900, 4.6, 6, "Home Appliances"),
                new ProductSeed("Havells Room Heater", "Havells", 2499, 4.1, 22, "Home Appliances"),
                new ProductSeed("Orient Electric Ceiling Fan", "Orient", 2299, 4.2, 28, "Home Appliances"),
                new ProductSeed("Morphy Richards OTG 28L", "Morphy Richards", 6999, 4.3, 11, "Home Appliances"),
                new ProductSeed("Kent 7L RO Water Purifier", "Kent", 11999, 4.2, 10, "Home Appliances")
            );

            Map<String, Product> existing = productRepository.findAll()
                    .stream()
                    .collect(Collectors.toMap(
                            p -> p.getName().trim().toLowerCase(),
                            Function.identity(),
                            (first, second) -> first));

            int inserted = 0;
            for (ProductSeed seed : seeds) {
                String key = seed.name().trim().toLowerCase();
                if (existing.containsKey(key)) {
                    continue;
                }

                Product product = new Product();
                product.setName(seed.name());
                product.setBrand(seed.brand());
                product.setPrice(seed.price());
                product.setRating(seed.rating());
                product.setQuantity(seed.quantity());
                product.setCategory(categories.get(seed.category().toLowerCase()));
                productRepository.save(product);
                existing.put(key, product);
                inserted++;
            }

            System.out.println("BasketBro catalog seed complete: added "
                    + inserted + " products; total catalog size: "
                    + productRepository.count());
        };
    }
}

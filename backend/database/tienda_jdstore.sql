-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: tienda_jdstore
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre_categoria` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `nombre_categoria` (`nombre_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (9,'Accesorios varios'),(8,'Cables y adaptadores'),(2,'Computadoras de escritorio'),(3,'Impresoras'),(1,'Laptops'),(7,'Memorias y almacenamiento'),(6,'Monitores'),(10,'Proyectores'),(5,'Teclados y mouse'),(4,'Tintas y tóneres');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id_cliente` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `tipo_documento` enum('DNI','RUC') COLLATE utf8mb4_general_ci NOT NULL,
  `dni_ruc` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `direccion` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `dni_ruc` (`dni_ruc`)
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (1,'Lucía Mamani Torres','DNI','45123678','987654321','Jr. Tacna 234, Juliaca',1),(2,'Roberto Choque Huanca','DNI','47891234','976543210','Av. Los Incas 567, Juliaca',1),(3,'Nadia Quispe Larico','DNI','43567890','965432109','Jr. Piura 89, Puno',1),(4,'Ernesto Apaza Ccari','DNI','48234567','954321098','Psje. Las Flores 12, Juliaca',1),(5,'Sandra Condori Puma','DNI','46789012','943210987','Jr. Arequipa 341, Juliaca',1),(6,'Wilber Ticona Calisaya','DNI','44012345','932109876','Av. Aviación 780, Juliaca',1),(7,'Gloria Ramos Flores','DNI','49345678','921098765','Jr. Cusco 99, Puno',1),(8,'Mario Huanca Coaquira','DNI','42678901','910987654','Jr. Puno 445, Juliaca',1),(9,'Colegio Privado Los Andes SAC','RUC','20601234567','951111222','Jr. Educación 200, Juliaca',1),(10,'Municipalidad Provincial de San Román','RUC','20447890123','951333444','Plaza de Armas s/n, Juliaca',1),(11,'Ferretería y Tecnología Altiplano EIRL','RUC','20512345678','951555666','Jr. Comercio 678, Juliaca',1),(12,'Hotel Suites Titicaca SRL','RUC','20678901234','951777888','Av. El Puerto 150, Puno',1),(13,'Marlon Sucasaire ','DNI','73121980','943511717','jr. moquegua 705',1),(14,'Agustina Lipa Perez','DNI','02028998','953511789','jr. lima N° 1234 ',1),(999,'Clientes Varios','DNI','00000000',NULL,'Juliaca, Puno',1);
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compras`
--

DROP TABLE IF EXISTS `compras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compras` (
  `id_compra` int NOT NULL AUTO_INCREMENT,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `total` decimal(10,2) NOT NULL,
  `id_proveedor` int NOT NULL,
  `id_tienda` int NOT NULL,
  PRIMARY KEY (`id_compra`),
  KEY `id_proveedor` (`id_proveedor`),
  KEY `id_tienda` (`id_tienda`),
  CONSTRAINT `compras_ibfk_1` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`),
  CONSTRAINT `compras_ibfk_2` FOREIGN KEY (`id_tienda`) REFERENCES `tiendas` (`id_tienda`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compras`
--

LOCK TABLES `compras` WRITE;
/*!40000 ALTER TABLE `compras` DISABLE KEYS */;
INSERT INTO `compras` VALUES (1,'2025-01-10 09:00:00',8740.00,1,1),(2,'2025-01-15 10:30:00',3450.00,2,1),(3,'2025-02-05 08:45:00',5600.00,1,2),(4,'2025-02-20 11:00:00',1980.00,5,1),(5,'2025-03-01 09:15:00',4200.00,3,1),(6,'2025-03-18 14:00:00',2100.00,4,3);
/*!40000 ALTER TABLE `compras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_compra`
--

DROP TABLE IF EXISTS `detalle_compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_compra` (
  `id_detalle_compra` int NOT NULL AUTO_INCREMENT,
  `id_compra` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_compra` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id_detalle_compra`),
  KEY `id_compra` (`id_compra`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `detalle_compra_ibfk_1` FOREIGN KEY (`id_compra`) REFERENCES `compras` (`id_compra`),
  CONSTRAINT `detalle_compra_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_compra`
--

LOCK TABLES `detalle_compra` WRITE;
/*!40000 ALTER TABLE `detalle_compra` DISABLE KEYS */;
INSERT INTO `detalle_compra` VALUES (1,1,1,2,2400.00,4800.00),(2,1,3,2,2100.00,4200.00),(3,2,9,5,560.00,2800.00),(4,2,14,20,12.00,240.00),(5,2,20,10,34.00,340.00),(6,2,21,10,19.00,190.00),(7,3,1,2,2400.00,4800.00),(8,3,9,5,560.00,2800.00),(9,4,14,30,12.00,360.00),(10,4,15,30,12.00,360.00),(11,4,16,30,12.00,360.00),(12,4,17,30,12.00,360.00),(13,4,18,15,16.00,240.00),(14,4,19,10,62.00,620.00),(15,5,5,3,2350.00,7050.00),(16,5,28,10,95.00,950.00),(17,5,29,5,130.00,650.00),(18,6,20,8,34.00,272.00),(19,6,21,10,19.00,190.00),(20,6,23,15,12.00,180.00);
/*!40000 ALTER TABLE `detalle_compra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_venta`
--

DROP TABLE IF EXISTS `detalle_venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_venta` (
  `id_detalle_venta` int NOT NULL AUTO_INCREMENT,
  `id_venta` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `descuento_monto` decimal(10,2) DEFAULT '0.00' COMMENT 'Descuento en soles por unidad',
  `costo_unitario` decimal(10,2) DEFAULT '0.00',
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_detalle_venta`),
  KEY `id_venta` (`id_venta`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `detalle_venta_ibfk_1` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id_venta`),
  CONSTRAINT `detalle_venta_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_venta`
--

LOCK TABLES `detalle_venta` WRITE;
/*!40000 ALTER TABLE `detalle_venta` DISABLE KEYS */;
INSERT INTO `detalle_venta` VALUES (1,1,1,1,2899.00,0.00,2029.30,2899.00),(2,1,21,1,29.00,0.00,20.30,29.00),(3,2,9,1,699.00,0.00,489.30,699.00),(4,2,14,2,18.90,0.00,13.23,37.80),(5,2,15,1,18.90,0.00,13.23,18.90),(6,2,16,1,18.90,0.00,13.23,18.90),(7,2,17,1,18.90,0.00,13.23,18.90),(8,3,3,3,2499.00,0.00,1749.30,7497.00),(9,3,34,1,1899.00,0.00,1329.30,1899.00),(10,3,22,3,69.00,0.00,48.30,207.00),(11,4,24,1,35.00,0.00,24.50,35.00),(12,4,30,1,35.00,0.00,24.50,35.00),(13,4,21,2,29.00,0.00,20.30,58.00),(14,5,28,1,129.00,0.00,90.30,129.00),(15,5,29,1,179.00,0.00,125.30,179.00),(16,6,7,2,2299.00,0.00,1609.30,4598.00),(17,6,8,2,1899.00,0.00,1329.30,3798.00),(18,6,25,2,599.00,0.00,419.30,1198.00),(19,7,11,1,749.00,0.00,524.30,749.00),(20,7,18,2,22.90,0.00,16.03,45.80),(21,7,15,2,18.90,0.00,13.23,37.80),(22,8,6,1,2650.00,0.00,1855.00,2650.00),(23,9,26,1,699.00,0.00,489.30,699.00),(24,10,4,1,4199.00,0.00,2939.30,4199.00),(25,10,21,1,29.00,0.00,20.30,29.00),(26,11,14,2,18.90,0.00,13.23,37.80),(27,11,15,1,18.90,0.00,13.23,18.90),(28,11,19,1,79.00,0.00,55.30,79.00),(29,12,20,1,49.00,0.00,34.30,49.00),(30,12,33,1,45.00,0.00,31.50,45.00),(31,12,23,1,19.00,0.00,13.30,19.00),(32,13,8,2,1899.00,0.00,1329.30,3798.00),(33,13,28,4,129.00,0.00,90.30,516.00),(34,13,30,5,35.00,0.00,24.50,175.00),(35,14,30,2,35.00,0.00,24.50,70.00),(36,15,1,1,2899.00,0.00,2029.30,2899.00),(37,15,21,1,29.00,0.00,20.30,29.00),(38,15,9,1,699.00,0.00,489.30,699.00),(39,15,34,1,1899.00,0.00,1329.30,1899.00),(40,17,32,1,35.00,0.00,24.50,35.00),(41,18,2,1,3599.00,0.00,2519.30,3599.00);
/*!40000 ALTER TABLE `detalle_venta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventario_tienda`
--

DROP TABLE IF EXISTS `inventario_tienda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario_tienda` (
  `id_inventario` int NOT NULL AUTO_INCREMENT,
  `id_tienda` int NOT NULL,
  `id_producto` int NOT NULL,
  `stock` int DEFAULT '0',
  `stock_minimo` int DEFAULT '5',
  PRIMARY KEY (`id_inventario`),
  KEY `id_tienda` (`id_tienda`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `inventario_tienda_ibfk_1` FOREIGN KEY (`id_tienda`) REFERENCES `tiendas` (`id_tienda`),
  CONSTRAINT `inventario_tienda_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario_tienda`
--

LOCK TABLES `inventario_tienda` WRITE;
/*!40000 ALTER TABLE `inventario_tienda` DISABLE KEYS */;
INSERT INTO `inventario_tienda` VALUES (1,1,1,7,3),(2,1,2,3,2),(3,1,3,12,3),(4,1,4,3,2),(5,1,5,6,3),(6,1,6,5,3),(7,1,7,4,2),(8,1,8,3,2),(9,1,9,14,5),(10,1,10,6,3),(11,1,11,8,3),(12,1,12,5,3),(13,1,13,10,5),(14,1,14,40,10),(15,1,15,35,10),(16,1,16,35,10),(17,1,17,35,10),(18,1,18,20,8),(19,1,19,15,5),(20,1,20,20,5),(21,1,21,24,5),(22,1,22,12,5),(23,1,23,30,8),(24,1,24,20,5),(25,1,25,5,2),(26,1,26,4,2),(27,1,27,4,2),(28,1,28,10,3),(29,1,29,8,3),(30,1,30,25,8),(31,1,32,14,5),(32,1,33,12,5),(33,1,34,1,1),(34,2,1,5,2),(35,2,3,7,2),(36,2,5,4,2),(37,2,9,10,3),(38,2,11,6,3),(39,2,14,30,8),(40,2,15,25,8),(41,2,16,25,8),(42,2,17,25,8),(43,2,20,15,5),(44,2,21,18,5),(45,2,23,20,5),(46,2,28,6,3),(47,2,30,15,5),(48,3,1,3,2),(49,3,3,4,2),(50,3,9,8,3),(51,3,14,20,8),(52,3,15,18,8),(53,3,20,10,5),(54,3,21,12,5),(55,3,28,4,2),(56,3,34,1,1);
/*!40000 ALTER TABLE `inventario_tienda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marcas`
--

DROP TABLE IF EXISTS `marcas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marcas` (
  `id_marca` int NOT NULL AUTO_INCREMENT,
  `nombre_marca` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id_marca`),
  UNIQUE KEY `nombre_marca` (`nombre_marca`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marcas`
--

LOCK TABLES `marcas` WRITE;
/*!40000 ALTER TABLE `marcas` DISABLE KEYS */;
INSERT INTO `marcas` VALUES (10,'Acer'),(4,'ASUS'),(13,'Brother'),(6,'Canon'),(3,'Dell'),(5,'Epson'),(14,'Genius'),(1,'HP'),(12,'Huawei'),(11,'Intel'),(8,'Kingston'),(2,'Lenovo'),(9,'Logitech'),(7,'Samsung');
/*!40000 ALTER TABLE `marcas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto_series`
--

DROP TABLE IF EXISTS `producto_series`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto_series` (
  `id_serie` int NOT NULL AUTO_INCREMENT,
  `id_producto` int NOT NULL,
  `id_tienda` int NOT NULL,
  `numero_serie` varchar(100) NOT NULL,
  `estado` tinyint(1) DEFAULT '1' COMMENT '1=disponible, 2=vendido, 0=inactivo/baja',
  `id_venta` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_serie`),
  UNIQUE KEY `uq_serie` (`numero_serie`),
  KEY `id_producto` (`id_producto`),
  KEY `id_tienda` (`id_tienda`),
  KEY `id_venta` (`id_venta`),
  CONSTRAINT `producto_series_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`),
  CONSTRAINT `producto_series_ibfk_2` FOREIGN KEY (`id_tienda`) REFERENCES `tiendas` (`id_tienda`),
  CONSTRAINT `producto_series_ibfk_3` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id_venta`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto_series`
--

LOCK TABLES `producto_series` WRITE;
/*!40000 ALTER TABLE `producto_series` DISABLE KEYS */;
INSERT INTO `producto_series` VALUES (1,1,1,'CND2024PE001',1,NULL,'2026-04-23 13:19:17','2026-04-23 13:19:17'),(2,1,1,'CND2024PE002',1,NULL,'2026-04-23 13:19:17','2026-04-23 13:19:17'),(3,1,1,'CND2024PE003',2,NULL,'2026-04-23 13:19:17','2026-04-23 13:19:17'),(4,2,1,'HPV2024PE001',1,NULL,'2026-04-23 13:19:17','2026-04-23 13:19:17'),(5,3,1,'LNV2024PE001',1,NULL,'2026-04-23 13:19:17','2026-04-23 13:19:17'),(6,9,1,'EPSL32-001',1,NULL,'2026-04-23 13:19:17','2026-04-23 13:19:17'),(7,9,1,'EPSL32-002',2,NULL,'2026-04-23 13:19:17','2026-04-23 13:19:17');
/*!40000 ALTER TABLE `producto_series` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `codigo_producto` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `nombre` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `modelo` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `precio` decimal(10,2) NOT NULL,
  `precio_costo_usd` decimal(10,2) DEFAULT NULL COMMENT 'Costo en USD (si aplica)',
  `precio_costo_pen` decimal(10,2) DEFAULT NULL COMMENT 'Costo en PEN calculado',
  `moneda_compra` enum('PEN','USD') COLLATE utf8mb4_general_ci DEFAULT 'PEN',
  `margen_porcentaje` decimal(5,2) DEFAULT '30.00' COMMENT '% margen sobre costo',
  `precio_sugerido` decimal(10,2) DEFAULT NULL COMMENT 'Precio auto por TC+margen',
  `afecto_igv` tinyint(1) DEFAULT '1' COMMENT '1=con IGV, 0=exonerado',
  `id_categoria` int NOT NULL,
  `id_marca` int NOT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_producto`),
  UNIQUE KEY `codigo_producto` (`codigo_producto`),
  KEY `id_categoria` (`id_categoria`),
  KEY `id_marca` (`id_marca`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`),
  CONSTRAINT `productos_ibfk_2` FOREIGN KEY (`id_marca`) REFERENCES `marcas` (`id_marca`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'LAP-HP-001','Laptop HP 14 Core i5','14-dq2535la','Laptop HP 14\" Intel Core i5-1135G7, 8GB RAM, 512GB SSD, W11 Home',2899.00,NULL,2029.30,'PEN',30.00,NULL,1,1,1,1),(2,'LAP-HP-002','Laptop HP Victus Gaming','15-fa0510la','Laptop Gamer HP Victus 15.6\" Intel Core i5-12450H, 8GB RAM, 512GB SSD, GTX 1650',3599.00,NULL,2519.30,'PEN',30.00,NULL,1,1,1,1),(3,'LAP-LEN-001','Laptop Lenovo IdeaPad 3','82H801HFLM','Laptop Lenovo 15.6\" AMD Ryzen 5 5500U, 8GB RAM, 256GB SSD, W11 Home',2499.00,NULL,1749.30,'PEN',30.00,NULL,1,1,2,1),(4,'LAP-LEN-002','Laptop Lenovo ThinkPad E14','21E30057PE','Laptop Profesional Lenovo 14\" Intel Core i7-1255U, 16GB RAM, 512GB SSD',4199.00,NULL,2939.30,'PEN',30.00,NULL,1,1,2,1),(5,'LAP-ASUS-001','Laptop ASUS VivoBook 15','X1502ZA-EJ563W','Laptop ASUS 15.6\" Intel Core i5-12500H, 8GB RAM, 512GB SSD, W11',2799.00,NULL,1959.30,'PEN',30.00,NULL,1,1,4,1),(6,'LAP-ACER-001','Laptop Acer Aspire 5','A515-57-52VH','Laptop Acer 15.6\" Intel Core i5-12450H, 8GB RAM, 512GB SSD, W11 Home',2650.00,NULL,1855.00,'PEN',30.00,NULL,1,1,10,1),(7,'PC-HP-001','PC HP All-in-One 24','24-df1020la','PC Todo en Uno HP 23.8\" Intel Core i5-1135G7, 8GB RAM, 1TB HDD, W11',2299.00,NULL,1609.30,'PEN',30.00,NULL,1,2,1,1),(8,'PC-LEN-001','PC Lenovo IdeaCentre 3','07ADA05SPE','PC Escritorio Lenovo AMD Ryzen 3 3250U, 8GB RAM, 256GB SSD, W11',1899.00,NULL,1329.30,'PEN',30.00,NULL,1,2,2,1),(9,'IMP-EP-001','Impresora Epson EcoTank L3250','L3250','Impresora Multifuncional Epson Tinta Continua, USB + WiFi, Color',699.00,NULL,489.30,'PEN',30.00,NULL,1,3,5,1),(10,'IMP-EP-002','Impresora Epson EcoTank L5290','L5290','Impresora Multifuncional Epson Tinta Continua, WiFi, ADF, Fax',999.00,NULL,699.30,'PEN',30.00,NULL,1,3,5,1),(11,'IMP-CA-001','Impresora Canon PIXMA G3160','G3160','Impresora Multifuncional Canon Tinta Continua, WiFi, Color',749.00,NULL,524.30,'PEN',30.00,NULL,1,3,6,1),(12,'IMP-BRO-001','Impresora Brother DCP-T720DW','DCP-T720DW','Impresora Multifuncional Brother Tinta, WiFi, Duplex Automático',849.00,NULL,594.30,'PEN',30.00,NULL,1,3,13,1),(13,'IMP-HP-001','Impresora HP LaserJet M110we','M110we','Impresora Láser HP Monocromática, WiFi, HP+',449.00,NULL,314.30,'PEN',30.00,NULL,1,3,1,1),(14,'TIN-EP-001','Tinta Epson 664 Negro','T664120-AL','Tinta Epson Original 664 Negro para EcoTank, 70ml',18.90,NULL,13.23,'PEN',30.00,NULL,1,4,5,1),(15,'TIN-EP-002','Tinta Epson 664 Cian','T664220-AL','Tinta Epson Original 664 Cian para EcoTank, 70ml',18.90,NULL,13.23,'PEN',30.00,NULL,1,4,5,1),(16,'TIN-EP-003','Tinta Epson 664 Magenta','T664320-AL','Tinta Epson Original 664 Magenta para EcoTank, 70ml',18.90,NULL,13.23,'PEN',30.00,NULL,1,4,5,1),(17,'TIN-EP-004','Tinta Epson 664 Amarillo','T664420-AL','Tinta Epson Original 664 Amarillo para EcoTank, 70ml',18.90,NULL,13.23,'PEN',30.00,NULL,1,4,5,1),(18,'TIN-CA-001','Tinta Canon GI-10 Negro','GI-10BK','Tinta Canon Original GI-10 Negro para PIXMA G, 70ml',22.90,NULL,16.03,'PEN',30.00,NULL,1,4,6,1),(19,'TON-HP-001','Tóner HP 105A Negro','W1105A','Tóner HP Original 105A Negro para LaserJet, 1000 páginas',79.00,NULL,55.30,'PEN',30.00,NULL,1,4,1,1),(20,'TEC-LOG-001','Teclado Logitech K120','K120','Teclado Logitech USB, diseño español, resistente al agua',49.00,NULL,34.30,'PEN',30.00,NULL,1,5,9,1),(21,'TEC-LOG-002','Mouse Logitech M90','M90','Mouse Logitech USB óptico, 1000 DPI, ambidiestro',29.00,NULL,20.30,'PEN',30.00,NULL,1,5,9,1),(22,'TEC-LOG-003','Kit Teclado+Mouse Logitech MK120','MK120','Kit Teclado y Mouse Logitech USB, diseño español',69.00,NULL,48.30,'PEN',30.00,NULL,1,5,9,1),(23,'TEC-GEN-001','Mouse Genius DX-120','DX-120','Mouse Genius USB óptico 1200 DPI, ergonómico',19.00,NULL,13.30,'PEN',30.00,NULL,1,5,14,1),(24,'TEC-GEN-002','Teclado Genius KB-100','KB-100','Teclado Genius USB slim, diseño español',35.00,NULL,24.50,'PEN',30.00,NULL,1,5,14,1),(25,'MON-HP-001','Monitor HP V22i FHD','21.5\" V22i','Monitor HP 21.5\" Full HD 1920x1080, IPS, HDMI+VGA',599.00,NULL,419.30,'PEN',30.00,NULL,1,6,1,1),(26,'MON-SAM-001','Monitor Samsung 24\" FHD','LS24D300HLXPE','Monitor Samsung 24\" Full HD, 75Hz, FreeSync, HDMI',699.00,NULL,489.30,'PEN',30.00,NULL,1,6,7,1),(27,'MON-ASUS-001','Monitor ASUS VA24EHE 24\"','VA24EHE','Monitor ASUS 23.8\" Full HD, 75Hz, HDMI+VGA, Eye Care',649.00,NULL,454.30,'PEN',30.00,NULL,1,6,4,1),(28,'MEM-KIN-001','Memoria RAM Kingston 8GB DDR4','KVR32N22S8/8','Memoria RAM Kingston 8GB DDR4 3200MHz SODIMM para laptop',129.00,NULL,90.30,'PEN',30.00,NULL,1,7,8,1),(29,'MEM-KIN-002','SSD Kingston 480GB SATA','SA400S37/480G','SSD Kingston A400 480GB SATA III 2.5\"',179.00,NULL,125.30,'PEN',30.00,NULL,1,7,8,1),(30,'MEM-KIN-003','USB Kingston 64GB','DTSE9G3/64GB','USB Kingston DataTraveler SE9 G3 64GB USB 3.2',35.00,NULL,24.50,'PEN',30.00,NULL,1,7,8,1),(31,'CAB-001','Cable HDMI 1.8m','HDMI-1.8','Cable HDMI a HDMI 1.8 metros, 4K compatible, dorado',15.00,NULL,10.50,'PEN',30.00,NULL,1,8,1,0),(32,'CAB-002','Adaptador USB-C a HDMI','UC2HDMI','Adaptador USB-C macho a HDMI hembra, 4K@30Hz',35.00,NULL,24.50,'PEN',30.00,NULL,1,8,1,1),(33,'CAB-003','Regleta 6 tomas + USB','REG-6USB','Regleta 6 tomas con 2 puertos USB, cable 1.8m, protección sobretensión',45.00,NULL,31.50,'PEN',30.00,NULL,1,8,1,1),(34,'PRO-EP-001','Proyector Epson S41+','VS41','Proyector Epson 3300 lúmenes SVGA, HDMI+USB, para aula/sala',1899.00,NULL,1329.30,'PEN',30.00,NULL,1,10,5,1),(35,'5cd5 logitech','audifonos gamer ','ultra WAts','es un alatavoces potente a cable 3.5 jack, 7.1 sound \n',58.00,NULL,40.60,'PEN',30.00,NULL,1,9,9,1);
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedores`
--

DROP TABLE IF EXISTS `proveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedores` (
  `id_proveedor` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `direccion` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id_proveedor`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedores`
--

LOCK TABLES `proveedores` WRITE;
/*!40000 ALTER TABLE `proveedores` DISABLE KEYS */;
INSERT INTO `proveedores` VALUES (1,'Ingram Micro Perú SAC','014567890','Av. Argentina 2750, Lima'),(2,'Deltron SA','014678901','Av. Aviación 2664, Lima'),(3,'Intcomex Perú SAC','014789012','Jr. Camaná 891, Lima'),(4,'Cómputo Digital SRL','951888777','Jr. Comercio 123, Juliaca'),(5,'Epson Perú SA','014890123','Av. El Polo 670, Lima'),(6,'Importadora Tecnológica Altiplano EIRL','951999000','Av. Ferroviaria 456, Juliaca');
/*!40000 ALTER TABLE `proveedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reportes`
--

DROP TABLE IF EXISTS `reportes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reportes` (
  `id_reporte` int NOT NULL AUTO_INCREMENT,
  `tipo_reporte` enum('Diario','Semanal','Mensual') COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `total_ventas` decimal(10,2) DEFAULT NULL,
  `total_compras` decimal(10,2) DEFAULT NULL,
  `ganancia` decimal(10,2) DEFAULT NULL,
  `fecha_generacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `id_usuario` int NOT NULL,
  `id_tienda` int NOT NULL,
  PRIMARY KEY (`id_reporte`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_tienda` (`id_tienda`),
  CONSTRAINT `reportes_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `reportes_ibfk_2` FOREIGN KEY (`id_tienda`) REFERENCES `tiendas` (`id_tienda`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reportes`
--

LOCK TABLES `reportes` WRITE;
/*!40000 ALTER TABLE `reportes` DISABLE KEYS */;
INSERT INTO `reportes` VALUES (1,'Mensual','2025-01-01','2025-01-31',17066.00,8740.00,8326.00,'2025-02-01 08:00:00',1,1),(2,'Mensual','2025-02-01','2025-02-28',14557.00,7580.00,6977.00,'2025-03-01 08:00:00',1,1),(3,'Mensual','2025-03-01','2025-03-31',10320.00,6300.00,4020.00,'2025-04-01 08:00:00',1,1),(4,'Semanal','2025-03-17','2025-03-23',5414.00,0.00,5414.00,'2025-03-24 08:00:00',1,1),(5,'Diario','2025-03-25','2025-03-25',70.00,0.00,70.00,'2025-03-25 23:59:00',1,1);
/*!40000 ALTER TABLE `reportes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `nombre_rol` (`nombre_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrador'),(2,'Vendedor');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tiendas`
--

DROP TABLE IF EXISTS `tiendas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tiendas` (
  `id_tienda` int NOT NULL AUTO_INCREMENT,
  `nombre_tienda` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `direccion` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_tienda`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tiendas`
--

LOCK TABLES `tiendas` WRITE;
/*!40000 ALTER TABLE `tiendas` DISABLE KEYS */;
INSERT INTO `tiendas` VALUES (1,'JD Store Central','Jr. Noriega 342, Juliaca','951234567',1),(2,'JD Store San Román','Av. Circunvalación 890, Juliaca','951234568',1),(3,'JD Store Puno','Jr. Lima 156, Puno','951234569',1);
/*!40000 ALTER TABLE `tiendas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_cambio`
--

DROP TABLE IF EXISTS `tipo_cambio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_cambio` (
  `id_tc` int NOT NULL AUTO_INCREMENT,
  `valor_usd` decimal(8,4) NOT NULL COMMENT 'Soles por 1 dólar, ej: 3.7500',
  `fuente` enum('manual','api') COLLATE utf8mb4_general_ci DEFAULT 'manual',
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `id_usuario` int DEFAULT NULL COMMENT 'Quién lo actualizó',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_tc`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `tipo_cambio_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_cambio`
--

LOCK TABLES `tipo_cambio` WRITE;
/*!40000 ALTER TABLE `tipo_cambio` DISABLE KEYS */;
INSERT INTO `tipo_cambio` VALUES (1,3.7500,'manual','2026-04-19','08:29:25',1,'2026-04-19 08:29:25'),(2,3.7500,'manual','2026-04-19','08:33:52',1,'2026-04-19 08:33:52');
/*!40000 ALTER TABLE `tipo_cambio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `correo` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `contrasena` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `id_rol` int NOT NULL,
  `id_tienda` int NOT NULL,
  `estado` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo` (`correo`),
  KEY `id_rol` (`id_rol`),
  KEY `id_tienda` (`id_tienda`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`),
  CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`id_tienda`) REFERENCES `tiendas` (`id_tienda`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Juan Diego Quispe Mamani','admin@jdstore.pe','$2a$10$d/FfhRwgjR1/j1gCgw8e/e12gn5vU5GWoQSrCnZZxTAjEsbaLBrbS',1,1,1,'2026-04-14 11:07:44','2026-04-17 11:48:08'),(2,'Rocío Apaza Condori','rocio.apaza@jdstore.pe','$2a$10$d/FfhRwgjR1/j1gCgw8e/e12gn5vU5GWoQSrCnZZxTAjEsbaLBrbS',1,2,1,'2026-04-14 11:07:44','2026-04-17 11:48:08'),(3,'Carlos Huanca Larico','carlos.v1@jdstore.pe','$2a$10$h9IWs7bxTPwv4omiqVNyx.YYl2f4xpK47TqDYc6gHw72//.BRpie6',2,1,1,'2026-04-14 11:07:44','2026-04-17 11:48:08'),(4,'Yenny Flores Calisaya','yenny.v2@jdstore.pe','$2a$10$h9IWs7bxTPwv4omiqVNyx.YYl2f4xpK47TqDYc6gHw72//.BRpie6',2,1,1,'2026-04-14 11:07:44','2026-04-17 11:48:08'),(5,'Pedro Ticona Ramos','pedro.v3@jdstore.pe','$2a$10$h9IWs7bxTPwv4omiqVNyx.YYl2f4xpK47TqDYc6gHw72//.BRpie6',2,2,1,'2026-04-14 11:07:44','2026-04-17 11:48:08'),(6,'Miriam Coaquira Puma','miriam.v4@jdstore.pe','$2a$10$h9IWs7bxTPwv4omiqVNyx.YYl2f4xpK47TqDYc6gHw72//.BRpie6',2,3,1,'2026-04-14 11:07:44','2026-04-17 11:48:08'),(7,'Prueba JD','test@jdstore.pe','$2a$10$d/FfhRwgjR1/j1gCgw8e/e12gn5vU5GWoQSrCnZZxTAjEsbaLBrbS',1,1,1,'2026-04-15 19:41:18','2026-04-17 11:48:08'),(8,'prueba','prueba@jdstore.pe','$2a$10$k34HxgYq4BhYoHMHK.J93.CRs5zAl3byum8j3CvgfJbR1PMJu.AuC',1,3,1,'2026-04-22 17:39:44','2026-04-22 17:39:44');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventas`
--

DROP TABLE IF EXISTS `ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventas` (
  `id_venta` int NOT NULL AUTO_INCREMENT,
  `numero_comprobante` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `serie` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `correlativo` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tipo_comprobante` enum('Boleta','Factura','Nota de Venta') COLLATE utf8mb4_general_ci NOT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `igv` decimal(10,2) DEFAULT NULL,
  `costo_total` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL,
  `descuento_total` decimal(10,2) DEFAULT '0.00',
  `utilidad` decimal(10,2) DEFAULT '0.00',
  `notas_internas` text COLLATE utf8mb4_general_ci,
  `metodo_pago` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado_sunat` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `codigo_sunat` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `hash_sunat` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mensaje_sunat` text COLLATE utf8mb4_general_ci,
  `enlace_pdf` text COLLATE utf8mb4_general_ci,
  `enlace_xml` text COLLATE utf8mb4_general_ci,
  `enlace_cdr` text COLLATE utf8mb4_general_ci,
  `api_enviado` tinyint(1) DEFAULT '0',
  `fecha_envio_api` datetime DEFAULT NULL,
  `id_cliente` int NOT NULL,
  `id_usuario` int NOT NULL,
  `id_tienda` int NOT NULL,
  PRIMARY KEY (`id_venta`),
  UNIQUE KEY `numero_comprobante` (`numero_comprobante`),
  KEY `id_cliente` (`id_cliente`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_tienda` (`id_tienda`),
  CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  CONSTRAINT `ventas_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `ventas_ibfk_3` FOREIGN KEY (`id_tienda`) REFERENCES `tiendas` (`id_tienda`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas`
--

LOCK TABLES `ventas` WRITE;
/*!40000 ALTER TABLE `ventas` DISABLE KEYS */;
INSERT INTO `ventas` VALUES (1,'B001-00001','B001','00001','Boleta','2026-04-22 15:34:38',2449.15,440.85,2049.60,2890.00,0.00,399.55,NULL,'Efectivo','ACEPTADO','0','HASH001ABC','Comprobante aceptado por SUNAT','https://nubefact.com/pdf/B001-00001','https://nubefact.com/xml/B001-00001','https://nubefact.com/cdr/B001-00001',1,'2025-01-12 10:17:00',1,3,1),(2,'B001-00002','B001','00002','Boleta','2026-04-22 15:34:38',625.42,112.58,555.45,738.00,0.00,69.97,NULL,'Yape','ACEPTADO','0','HASH002DEF','Comprobante aceptado por SUNAT','https://nubefact.com/pdf/B001-00002','https://nubefact.com/xml/B001-00002','https://nubefact.com/cdr/B001-00002',1,'2025-01-14 11:32:00',2,3,1),(3,'F001-00001','F001','00001','Factura','2026-04-22 15:34:38',10423.73,1876.27,6722.10,12300.00,0.00,3701.63,NULL,'Transferencia','ACEPTADO','0','HASH003GHI','Comprobante aceptado por SUNAT','https://nubefact.com/pdf/F001-00001','https://nubefact.com/xml/F001-00001','https://nubefact.com/cdr/F001-00001',1,'2025-01-20 09:05:00',9,1,1),(4,'B001-00003','B001','00003','Boleta','2026-04-22 15:34:38',110.17,19.83,89.60,130.00,0.00,20.57,NULL,'Efectivo','ACEPTADO','0','HASH004JKL','Comprobante aceptado por SUNAT','https://nubefact.com/pdf/B001-00003','https://nubefact.com/xml/B001-00003','https://nubefact.com/cdr/B001-00003',1,'2025-01-22 16:47:00',3,4,1),(5,'B001-00004','B001','00004','Boleta','2026-04-22 15:34:38',261.02,46.98,215.60,308.00,0.00,45.42,NULL,'POS Visa','ACEPTADO','0','HASH005MNO','Comprobante aceptado por SUNAT','https://nubefact.com/pdf/B001-00004','https://nubefact.com/xml/B001-00004','https://nubefact.com/cdr/B001-00004',1,'2025-02-03 12:02:00',4,3,1),(6,'F001-00002','F001','00002','Factura','2026-04-22 15:34:38',8559.32,1540.68,6715.80,10100.00,0.00,1843.52,NULL,'Transferencia','ACEPTADO','0','HASH006PQR','Comprobante aceptado por SUNAT','https://nubefact.com/pdf/F001-00002','https://nubefact.com/xml/F001-00002','https://nubefact.com/cdr/F001-00002',1,'2025-02-10 10:08:00',10,1,1),(7,'B001-00005','B001','00005','Boleta','2026-04-22 15:34:38',854.24,153.76,582.82,1008.00,0.00,271.42,NULL,'Yape','ACEPTADO','0','HASH007STU','Comprobante aceptado por SUNAT','https://nubefact.com/pdf/B001-00005','https://nubefact.com/xml/B001-00005','https://nubefact.com/cdr/B001-00005',1,'2025-02-15 14:22:00',5,3,1),(8,'B001-00006','B001','00006','Boleta','2026-04-22 15:34:38',2245.76,404.24,1855.00,2650.00,0.00,390.76,NULL,'POS MasterCard','ACEPTADO','0','HASH008VWX','Comprobante aceptado por SUNAT','https://nubefact.com/pdf/B001-00006','https://nubefact.com/xml/B001-00006','https://nubefact.com/cdr/B001-00006',1,'2025-02-22 09:32:00',6,3,1),(9,'B001-00007','B001','00007','Boleta','2026-04-22 15:34:38',592.37,106.63,489.30,699.00,0.00,103.07,NULL,'Efectivo','ACEPTADO','0','HASH009YZA','Comprobante aceptado por SUNAT','https://nubefact.com/pdf/B001-00007','https://nubefact.com/xml/B001-00007','https://nubefact.com/cdr/B001-00007',1,'2025-03-05 11:17:00',7,3,1),(10,'F001-00003','F001','00003','Factura','2026-04-22 15:34:38',3983.05,716.95,2959.60,4700.00,0.00,1023.45,NULL,'Transferencia','ACEPTADO','0','HASH010BCD','Comprobante aceptado por SUNAT','https://nubefact.com/pdf/F001-00003','https://nubefact.com/xml/F001-00003','https://nubefact.com/cdr/F001-00003',1,'2025-03-10 08:50:00',12,1,1),(11,'B001-00008','B001','00008','Boleta','2026-04-22 15:34:38',115.25,20.75,94.99,136.00,0.00,20.26,NULL,'Efectivo','ACEPTADO','0','HASH011EFG','Comprobante aceptado por SUNAT','https://nubefact.com/pdf/B001-00008','https://nubefact.com/xml/B001-00008','https://nubefact.com/cdr/B001-00008',1,'2025-03-12 15:02:00',8,3,1),(12,'B002-00001','B002','00001','Boleta','2026-04-22 15:34:38',96.61,17.39,79.10,114.00,0.00,17.51,NULL,'Efectivo','ACEPTADO','0','HASH012HIJ','Comprobante aceptado por SUNAT','https://nubefact.com/pdf/B002-00001','https://nubefact.com/xml/B002-00001','https://nubefact.com/cdr/B002-00001',1,'2025-03-18 10:02:00',1,5,2),(13,'F001-00004','F001','00004','Factura','2026-04-22 15:34:38',4491.53,808.47,3142.30,5300.00,0.00,1349.23,NULL,'Transferencia','ACEPTADO','0','HASH013KLM','Comprobante aceptado por SUNAT','https://nubefact.com/pdf/F001-00004','https://nubefact.com/xml/F001-00004','https://nubefact.com/cdr/F001-00004',1,'2025-03-20 09:06:00',11,1,1),(14,'B001-00009','B001','00009','Boleta','2026-04-22 15:34:38',59.32,10.68,49.00,70.00,0.00,10.32,NULL,'Yape','ACEPTADO','0','HASH014NOP','Comprobante aceptado por SUNAT','https://nubefact.com/pdf/B001-00009','https://nubefact.com/xml/B001-00009','https://nubefact.com/cdr/B001-00009',1,'2025-03-25 13:42:00',2,4,1),(15,'B001-00010','B001','00010','Boleta','2026-04-22 15:34:38',4683.05,842.95,3868.20,5526.00,0.00,814.85,NULL,'Efectivo',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,4,3,1),(17,'B001-00020','B001','00020','Boleta','2026-04-22 15:34:38',29.66,5.34,24.50,35.00,0.00,5.16,NULL,'Efectivo',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,13,3,1),(18,'B001-00030','B001','00030','Boleta','2026-04-22 15:34:38',3050.00,549.00,2519.30,3599.00,0.00,530.70,NULL,'Efectivo',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,13,3,1);
/*!40000 ALTER TABLE `ventas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-23 13:21:20

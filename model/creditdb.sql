-- MySQL Script generated by MySQL Workbench
-- Sat May 21 15:49:18 2022
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema creditdb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema creditdb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `creditdb` DEFAULT CHARACTER SET utf8 ;
USE `creditdb` ;

-- -----------------------------------------------------
-- Table `creditdb`.`clients`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `creditdb`.`customers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `firstName` VARCHAR(45) NOT NULL,
  `lastName` VARCHAR(45) NOT NULL,
  `age` INT NOT NULL,
  `phoneNumber` VARCHAR(45) NOT NULL UNIQUE,
  `maritalStatus` VARCHAR(45) NOT NULL,
  `gender` VARCHAR(45) NOT NULL,
  `whiteIncome` VARCHAR(45) NOT NULL,
  `blackIncome` VARCHAR(45) NOT NULL,
  `occupation` VARCHAR(45) NOT NULL,
  `workPosition` VARCHAR(45) NOT NULL,
  `companyName` VARCHAR(45) NOT NULL,
  `documentNumber` VARCHAR(45) NOT NULL UNIQUE,
  `ipn` VARCHAR(45) NOT NULL UNIQUE,
  `socialStatus` VARCHAR(45) NOT NULL,
  `workingStatus` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `creditdb`.`rates`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `creditdb`.`rates` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `monthsNumber` INT NOT NULL,
  `percent` INT NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `creditdb`.`credits`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `creditdb`.`credits` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `moneyAmount` INT NOT NULL,
  `purpose` VARCHAR(255) NOT NULL,
  `dateFrom` DATE NOT NULL,
  `monthlyPayments` VARCHAR(255) NOT NULL,
  `status` VARCHAR(45) NOT NULL,
  `customer` INT NOT NULL,
  `rate` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `customer_idx` (`customer` ASC) VISIBLE,
  INDEX `rate_idx` (`rate` ASC) VISIBLE,
  CONSTRAINT `customer`
    FOREIGN KEY (`customer`)
    REFERENCES `creditdb`.`customers` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `rate`
    FOREIGN KEY (`rate`)
    REFERENCES `creditdb`.`rates` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `creditdb`.`managers`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `creditdb`.`managers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(45) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

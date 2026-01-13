package com.urlaubsplaner.uniprojekt.bl;

public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}

package com.urlaubsplaner.uniprojekt.mail;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class Mailer {
    
    @Autowired
    private JavaMailSender mailSender;
    
    public void sendEmail(String empfaenger, String betreff, String nachricht) {
        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(empfaenger);
        email.setSubject(betreff);
        email.setText(nachricht);
        email.setFrom("holly.day.planer@gmail.com");
        
        mailSender.send(email);
    }
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class Mailer {

    private final JavaMailSender mailSender;

    public Mailer(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public boolean sendVerificationMail(String to, String code) {
        try {
            var message = mailSender.createMimeMessage();
            var helper = new org.springframework.mail.javamail.MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject("Your Verification Code");
            String content = "<p>Your verification code is: <b>" + code + "</b></p>";
            helper.setText(content, true);
            mailSender.send(message);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

}

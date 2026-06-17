package services

import (
	"fmt"
	"net/smtp"
)

type EmailService struct{}

func NewEmailService() *EmailService {
	return &EmailService{}
}

func (s *EmailService) SendTicketCreatedEmail(
	toEmail string,
	ticketID int,
	ticketTitle string,
	description string,
) error {

	// =====================================
	// SMTP CONFIG
	// =====================================

	from :=
		"support@buson.in"

	password :=
		"BusOn@123"

	smtpHost :=
		"smtppro.zoho.in"

	smtpPort :=
		"587"

	fromName := "Buson Digital Services"

	// =====================================
	// EMAIL BODY
	// =====================================

	subject :=
		fmt.Sprintf(
			"[%d] %s - Ticket Created Successfully",
			ticketID,
			ticketTitle,
		)

	body :=
		fmt.Sprintf(
			`
Dear Sir/Madam,

Your Ticket [%d] - %s has been raised successfully.

After review by our support team,
we will get back to you.

Description:
%s

Thank You,
%s

For assistance, please call our support team
+0422 350 1946/1947

We're available Monday to Friday,
from 10 AM to 7 PM

Submit a Ticket:
http://164.52.217.188:8082/
`,
			ticketID,
			ticketTitle,
			description,
			fromName,
		)

	message :=
		[]byte(
			"From: " + fromName + " <" + from + ">\r\n" +
				"To: " + toEmail + "\r\n" +
				"Subject: " + subject + "\r\n" +
				"MIME-Version: 1.0\r\n" +
				"Content-Type: text/plain; charset=\"UTF-8\"\r\n\r\n" +
				body,
		)

	auth :=
		smtp.PlainAuth(
			"",
			from,
			password,
			smtpHost,
		)

	err :=
		smtp.SendMail(
			smtpHost+":"+smtpPort,
			auth,
			from,
			[]string{
				toEmail,
			},
			message,
		)

	if err != nil {

		return fmt.Errorf(
			"failed to send email: %w",
			err,
		)
	}

	return nil
}

func (s *EmailService) SendCommentNotificationEmail(
	toEmail string,
	ticketID int,
	ticketTitle string,
	commentedUser string,
	commentMessage string,
) error {

	smtpHost :=
		"smtppro.zoho.in"

	smtpPort :=
		"587"

	senderMail :=
		"support@buson.in"

	password :=
		"BusOn@123"

	fromName :=
		"Buson Digital Services"

	subject :=
		fmt.Sprintf(
			"[%d] %s - New Comment Added",
			ticketID,
			ticketTitle,
		)

	body :=
		fmt.Sprintf(
			`
Dear Sir/Madam,

A new comment has been added to your ticket [%d] - %s.

%s commented:

"%s"

Thank You,
%s

For assistance, please call our support team
+0422 350 1946/1947

We're available Monday to Friday,
from 10 AM to 7 PM

Submit a Ticket:
http://164.52.217.188:8082/
`,
			ticketID,
			ticketTitle,
			commentedUser,
			commentMessage,
			fromName,
		)

	message :=
		[]byte(
			"From: " + fromName + " <" + senderMail + ">\r\n" +
				"To: " + toEmail + "\r\n" +
				"Subject: " + subject + "\r\n" +
				"MIME-Version: 1.0\r\n" +
				"Content-Type: text/plain; charset=\"UTF-8\"\r\n\r\n" +
				body,
		)

	auth :=
		smtp.PlainAuth(
			"",
			senderMail,
			password,
			smtpHost,
		)

	err :=
		smtp.SendMail(
			smtpHost+":"+smtpPort,
			auth,
			senderMail,
			[]string{
				toEmail,
			},
			message,
		)

	if err != nil {

		return fmt.Errorf(
			"failed to send comment email: %w",
			err,
		)
	}

	return nil
}

func (s *EmailService) SendWelcomeEmail(

	toEmail string,

	userName string,

	passwordText string,

) error {

	// =====================================
	// SMTP CONFIG
	// =====================================

	from :=
		"support@buson.in"

	password :=
		"BusOn@123"

	smtpHost :=
		"smtppro.zoho.in"

	smtpPort :=
		"587"

	fromName :=
		"Buson Digital Services"

	// =====================================
	// SUBJECT
	// =====================================

	subject :=
		"Welcome to Buson Ticket Management System"

	// =====================================
	// BODY
	// =====================================

	body :=
		fmt.Sprintf(

			`
Dear %s,

Welcome to Buson Ticket Management System.

Your account has been created successfully.

=====================================

Login Credentials

Email:
%s

Password:
%s

=====================================

Login URL:
http://164.52.217.188:8082/login

For security reasons,
please change your password after login.

If you face any issues,
please contact our support team.

Support:
+0422 350 1946/1947

Available:
Monday to Friday
10 AM to 7 PM

Thank You,
%s
`,
			userName,
			toEmail,
			passwordText,
			fromName,
		)

	// =====================================
	// EMAIL MESSAGE
	// =====================================

	message :=
		[]byte(

			"From: " + fromName + " <" + from + ">\r\n" +

				"To: " + toEmail + "\r\n" +

				"Subject: " + subject + "\r\n" +

				"MIME-Version: 1.0\r\n" +

				"Content-Type: text/plain; charset=\"UTF-8\"\r\n\r\n" +

				body,
		)

	// =====================================
	// AUTH
	// =====================================

	auth :=
		smtp.PlainAuth(

			"",

			from,

			password,

			smtpHost,
		)

	// =====================================
	// SEND MAIL
	// =====================================

	err :=
		smtp.SendMail(

			smtpHost+":"+smtpPort,

			auth,

			from,

			[]string{
				toEmail,
			},

			message,
		)

	if err != nil {

		return fmt.Errorf(
			"failed to send welcome email: %w",
			err,
		)
	}

	return nil
}

func (s *EmailService) SendForgotPasswordEmail(

	toEmail string,

	resetURL string,

) error {

	from :=
		"support@buson.in"

	password :=
		"BusOn@123"

	smtpHost :=
		"smtppro.zoho.in"

	smtpPort :=
		"587"

	fromName :=
		"Buson Digital Services"

	subject :=
		"Reset Your Password"

	body :=
		fmt.Sprintf(

			`
Dear User,

We received a request to reset your password.

Click the link below to reset your password:

%s

This link will expire in 30 minutes.

If you did not request this,
please ignore this email.

Thank You,
%s
`,
			resetURL,
			fromName,
		)

	message :=
		[]byte(

			"From: " + fromName + " <" + from + ">\r\n" +

				"To: " + toEmail + "\r\n" +

				"Subject: " + subject + "\r\n" +

				"MIME-Version: 1.0\r\n" +

				"Content-Type: text/plain; charset=\"UTF-8\"\r\n\r\n" +

				body,
		)

	auth :=
		smtp.PlainAuth(
			"",
			from,
			password,
			smtpHost,
		)

	err :=
		smtp.SendMail(

			smtpHost+":"+smtpPort,

			auth,

			from,

			[]string{
				toEmail,
			},

			message,
		)

	if err != nil {

		return fmt.Errorf(
			"failed to send forgot password email: %w",
			err,
		)
	}

	return nil
}

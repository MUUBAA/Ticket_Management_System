-- Ticket Management System Database Schema
-- Microsoft SQL Server

-- Create database if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'TMS')
BEGIN
    CREATE DATABASE TMS;
END;
GO

USE TMS;
GO

-- Drop tables if they exist (in reverse order of dependencies)
IF OBJECT_ID('commentattachments', 'U') IS NOT NULL
    DROP TABLE commentattachments;

IF OBJECT_ID('attachments', 'U') IS NOT NULL
    DROP TABLE attachments;

IF OBJECT_ID('comments', 'U') IS NOT NULL
    DROP TABLE comments;

IF OBJECT_ID('tickets', 'U') IS NOT NULL
    DROP TABLE tickets;

IF OBJECT_ID('usermaster', 'U') IS NOT NULL
    DROP TABLE usermaster;

-- =============================================
-- Usermaster Table
-- =============================================
CREATE TABLE usermaster (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    emp_id VARCHAR(50),
    email VARCHAR(254) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    designation VARCHAR(100),
    report_to INT NULL,
    CreatedBy INT NULL,
    createdon DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updatedBY INT NULL,
    UpdatedOn DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    traceid UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    reset_token VARCHAR(500) NULL,
    reset_token_expiry DATETIME2 NULL,
    CONSTRAINT FK_usermaster_ReportTo FOREIGN KEY (report_to) REFERENCES usermaster(user_id),
    CONSTRAINT FK_usermaster_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES usermaster(user_id),
    CONSTRAINT FK_usermaster_UpdatedBY FOREIGN KEY (updatedBY) REFERENCES usermaster(user_id)
);

CREATE INDEX IX_usermaster_email ON usermaster(email);

-- =============================================
-- Tickets Table
-- =============================================
CREATE TABLE tickets (
    ticket_id INT PRIMARY KEY IDENTITY(1,1),
    customer_name VARCHAR(255) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    ticket_type VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Open',
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy INT NULL,
    updatedBY INT NULL,
    traceid UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT FK_tickets_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES usermaster(user_id),
    CONSTRAINT FK_tickets_updatedBY FOREIGN KEY (updatedBY) REFERENCES usermaster(user_id)
);

CREATE INDEX IX_tickets_status ON tickets(status);
CREATE INDEX IX_tickets_CreatedBy ON tickets(CreatedBy);

-- =============================================
-- Comments Table
-- =============================================
CREATE TABLE comments (
    comment_id INT PRIMARY KEY IDENTITY(1,1),
    ticket_id INT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy INT NULL,
    updatedBY INT NULL,
    UpdatedOn DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    traceid UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT FK_comments_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
    CONSTRAINT FK_comments_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES usermaster(user_id),
    CONSTRAINT FK_comments_updatedBY FOREIGN KEY (updatedBY) REFERENCES usermaster(user_id)
);

CREATE INDEX IX_comments_ticket_id ON comments(ticket_id);

-- =============================================
-- Attachments Table
-- =============================================
CREATE TABLE attachments (
    attachment_id INT PRIMARY KEY IDENTITY(1,1),
    ticket_id INT NOT NULL,
    url VARCHAR(1000),
    base64_data NVARCHAR(MAX),
    file_name VARCHAR(500),
    file_type VARCHAR(100),
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy INT NULL,
    updatedBY INT NULL,
    UpdatedOn DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    traceid UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT FK_attachments_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
    CONSTRAINT FK_attachments_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES usermaster(user_id),
    CONSTRAINT FK_attachments_updatedBY FOREIGN KEY (updatedBY) REFERENCES usermaster(user_id)
);

CREATE INDEX IX_attachments_ticket_id ON attachments(ticket_id);

-- =============================================
-- CommentAttachments Table
-- =============================================
CREATE TABLE commentattachments (
    attachment_id INT PRIMARY KEY IDENTITY(1,1),
    comment_id INT NOT NULL,
    url VARCHAR(1000) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy INT NULL,
    updatedBY INT NULL,
    UpdatedOn DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    traceid UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT FK_commentattachments_comment FOREIGN KEY (comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE,
    CONSTRAINT FK_commentattachments_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES usermaster(user_id),
    CONSTRAINT FK_commentattachments_updatedBY FOREIGN KEY (updatedBY) REFERENCES usermaster(user_id)
);

CREATE INDEX IX_commentattachments_comment_id ON commentattachments(comment_id);

-- =============================================
-- Stored Procedures
-- =============================================
GO

-- Drop existing stored procedures if they exist
IF OBJECT_ID('sp_GetUserByEmail', 'P') IS NOT NULL DROP PROCEDURE sp_GetUserByEmail;
IF OBJECT_ID('sp_CreateUser', 'P') IS NOT NULL DROP PROCEDURE sp_CreateUser;
IF OBJECT_ID('sp_CreateTicket', 'P') IS NOT NULL DROP PROCEDURE sp_CreateTicket;
IF OBJECT_ID('sp_GetTickets', 'P') IS NOT NULL DROP PROCEDURE sp_GetTickets;
IF OBJECT_ID('sp_GetTicketById', 'P') IS NOT NULL DROP PROCEDURE sp_GetTicketById;
IF OBJECT_ID('sp_UpdateTicket', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateTicket;
IF OBJECT_ID('sp_DeleteTicket', 'P') IS NOT NULL DROP PROCEDURE sp_DeleteTicket;
IF OBJECT_ID('sp_AddComment', 'P') IS NOT NULL DROP PROCEDURE sp_AddComment;
IF OBJECT_ID('sp_AddTicketAttachment', 'P') IS NOT NULL DROP PROCEDURE sp_AddTicketAttachment;
IF OBJECT_ID('sp_AddCommentAttachment', 'P') IS NOT NULL DROP PROCEDURE sp_AddCommentAttachment;
IF OBJECT_ID('sp_UpdateComment', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateComment;
IF OBJECT_ID('sp_DeleteComment', 'P') IS NOT NULL DROP PROCEDURE sp_DeleteComment;
IF OBJECT_ID('sp_DeleteAttachment', 'P') IS NOT NULL DROP PROCEDURE sp_DeleteAttachment;
IF OBJECT_ID('sp_DeleteCommentAttachment', 'P') IS NOT NULL DROP PROCEDURE sp_DeleteCommentAttachment;
GO

-- Get user by email for login
CREATE PROCEDURE sp_GetUserByEmail
    @email VARCHAR(254)
AS
BEGIN
    SELECT user_id, name, company_name, emp_id, email, designation, report_to, traceid
    FROM usermaster
    WHERE email = @email;
END;
GO

CREATE PROCEDURE sp_CreateUser
    @name VARCHAR(255),
    @company_name VARCHAR(255),
    @emp_id VARCHAR(50),
    @email VARCHAR(254),
    @password VARCHAR(255),
    @designation VARCHAR(100),
    @report_to INT = NULL,
    @created_by INT = NULL,
    @updated_by INT = NULL,
    @user_id INT OUTPUT,
    @traceid UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- Generate traceid
    SET @traceid = NEWID();

    INSERT INTO usermaster 
    (name, company_name, emp_id, email, password, designation, report_to, CreatedBy, updatedBY, traceid)
    VALUES 
    (@name, @company_name, @emp_id, @email, @password, @designation, @report_to, @created_by, @updated_by, @traceid);

    -- Get inserted ID
    SET @user_id = SCOPE_IDENTITY();
END;
GO

-- Create new ticket
CREATE PROCEDURE sp_CreateTicket
    @customer_name VARCHAR(255),
    @employee_name VARCHAR(255),
    @project_name VARCHAR(255),
    @ticket_type VARCHAR(50),
    @description TEXT,
    @created_by INT,
    @ticket_id INT OUTPUT,
    @traceid UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO tickets (customer_name, employee_name, project_name, ticket_type, description, CreatedBy, updatedBY)
    OUTPUT INSERTED.ticket_id, INSERTED.traceid
    VALUES (@customer_name, @employee_name, @project_name, @ticket_type, @description, @created_by, @created_by);
END;
GO

-- Get paginated tickets with filters
CREATE PROCEDURE sp_GetTickets
    @page INT = 1,
    @pageSize INT = 10,
    @status VARCHAR(50) = NULL,
    @ticketType VARCHAR(50) = NULL,
    @search VARCHAR(255) = NULL,
    @sortBy VARCHAR(50) = 'created_at',
    @sortOrder VARCHAR(10) = 'DESC'
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @offset INT = (@page - 1) * @pageSize;
    
    SELECT
        t.ticket_id,
        t.customer_name,
        t.employee_name,
        t.project_name,
        t.ticket_type,
        t.description,
        t.status,
        t.created_at,
        t.updated_at,
        t.traceid,
        COUNT(*) OVER() as total_count
    FROM tickets t
    WHERE (@status IS NULL OR t.status = @status)
      AND (@ticketType IS NULL OR t.ticket_type = @ticketType)
      AND (@search IS NULL OR
           t.customer_name LIKE '%' + @search + '%' OR
           t.employee_name LIKE '%' + @search + '%' OR
           t.project_name LIKE '%' + @search + '%')
    ORDER BY
        CASE WHEN @sortBy = 'created_at' AND @sortOrder = 'ASC' THEN t.created_at END ASC,
        CASE WHEN @sortBy = 'created_at' AND @sortOrder = 'DESC' THEN t.created_at END DESC,
        CASE WHEN @sortBy = 'status' AND @sortOrder = 'ASC' THEN t.status END ASC,
        CASE WHEN @sortBy = 'status' AND @sortOrder = 'DESC' THEN t.status END DESC;
    
    SELECT
        @page as page,
        @pageSize as pageSize,
        CEILING(CAST((SELECT COUNT(*) FROM tickets
                      WHERE (@status IS NULL OR status = @status)
                        AND (@ticketType IS NULL OR ticket_type = @ticketType)
                        AND (@search IS NULL OR
                             customer_name LIKE '%' + @search + '%' OR
                             employee_name LIKE '%' + @search + '%' OR
                             project_name LIKE '%' + @search + '%')) AS FLOAT) / @pageSize) as totalPages;
END;
GO

-- Get ticket by ID with comments and attachments
CREATE PROCEDURE sp_GetTicketById
    @ticket_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Get ticket details
    SELECT
        t.ticket_id,
        t.customer_name,
        t.employee_name,
        t.project_name,
        t.ticket_type,
        t.description,
        t.status,
        t.created_at,
        t.updated_at,
        t.traceid,
        t.CreatedBy,
        t.updatedBY
    FROM tickets t
    WHERE t.ticket_id = @ticket_id;
    
    -- Get comments
    SELECT
        c.comment_id,
        c.ticket_id,
        c.user_name,
        c.message,
        c.created_at,
        c.traceid
    FROM comments c
    WHERE c.ticket_id = @ticket_id
    ORDER BY c.created_at ASC;
    
    -- Get attachments
    SELECT
        a.attachment_id,
        a.ticket_id,
        a.url,
        a.created_at
    FROM attachments a
    WHERE a.ticket_id = @ticket_id;
END;
GO

-- Update ticket
CREATE PROCEDURE sp_UpdateTicket
    @ticket_id INT,
    @customer_name VARCHAR(255),
    @employee_name VARCHAR(255),
    @project_name VARCHAR(255),
    @ticket_type VARCHAR(50),
    @description TEXT,
    @status VARCHAR(50),
    @updated_by INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE tickets
    SET
        customer_name = @customer_name,
        employee_name = @employee_name,
        project_name = @project_name,
        ticket_type = @ticket_type,
        description = @description,
        status = @status,
        updated_at = GETUTCDATE(),
        updatedBY = @updated_by
    WHERE ticket_id = @ticket_id;
END;
GO

-- Delete ticket
CREATE PROCEDURE sp_DeleteTicket
    @ticket_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DELETE FROM tickets WHERE ticket_id = @ticket_id;
END;
GO

-- Add comment to ticket
CREATE PROCEDURE sp_AddComment
    @ticket_id INT,
    @user_name VARCHAR(255),
    @message TEXT,
    @created_by INT,
    @comment_id INT OUTPUT,
    @traceid UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO comments (ticket_id, user_name, message, CreatedBy, updatedBY)
    OUTPUT INSERTED.comment_id, INSERTED.traceid
    VALUES (@ticket_id, @user_name, @message, @created_by, @created_by);
END;
GO

-- Add attachment to ticket
CREATE PROCEDURE sp_AddTicketAttachment
    @ticket_id INT,
    @url VARCHAR(1000),
    @created_by INT,
    @attachment_id INT OUTPUT,
    @traceid UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO attachments (ticket_id, url, CreatedBy, updatedBY)
    OUTPUT INSERTED.attachment_id, INSERTED.traceid
    VALUES (@ticket_id, @url, @created_by, @created_by);
END;
GO

-- Add ticket attachment with base64 data
CREATE PROCEDURE sp_AddTicketAttachmentBase64
    @ticket_id INT,
    @base64_data NVARCHAR(MAX),
    @file_name VARCHAR(500),
    @file_type VARCHAR(100),
    @created_by INT,
    @attachment_id INT OUTPUT,
    @traceid UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO attachments (ticket_id, base64_data, file_name, file_type, CreatedBy, updatedBY)
    OUTPUT INSERTED.attachment_id, INSERTED.traceid
    VALUES (@ticket_id, @base64_data, @file_name, @file_type, @created_by, @created_by);
END;
GO

-- Add attachment to comment
CREATE PROCEDURE sp_AddCommentAttachment
    @comment_id INT,
    @url VARCHAR(1000),
    @created_by INT,
    @attachment_id INT OUTPUT,
    @traceid UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO commentattachments (comment_id, url, CreatedBy, updatedBY)
    OUTPUT INSERTED.attachment_id, INSERTED.traceid
    VALUES (@comment_id, @url, @created_by, @created_by);
END;
GO

-- Update comment
CREATE PROCEDURE sp_UpdateComment
    @comment_id INT,
    @user_name VARCHAR(255),
    @message TEXT,
    @updated_by INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE comments
    SET
        user_name = @user_name,
        message = @message,
        UpdatedOn = GETUTCDATE(),
        updatedBY = @updated_by
    WHERE comment_id = @comment_id;
END;
GO

-- Delete comment
CREATE PROCEDURE sp_DeleteComment
    @comment_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DELETE FROM comments WHERE comment_id = @comment_id;
END;
GO

-- Delete attachment
CREATE PROCEDURE sp_DeleteAttachment
    @attachment_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DELETE FROM attachments WHERE attachment_id = @attachment_id;
END;
GO

-- Drop comment attachment
CREATE PROCEDURE sp_DeleteCommentAttachment
    @attachment_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DELETE FROM commentattachments WHERE attachment_id = @attachment_id;
END;
GO

-- Drop existing reset procedures if they exist
IF OBJECT_ID('sp_SetResetToken', 'P') IS NOT NULL DROP PROCEDURE sp_SetResetToken;
IF OBJECT_ID('sp_ResetPassword', 'P') IS NOT NULL DROP PROCEDURE sp_ResetPassword;
GO

-- Set reset token for password recovery
CREATE PROCEDURE sp_SetResetToken
    @email VARCHAR(255),
    @reset_token VARCHAR(500),
    @expiry DATETIME
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE usermaster
    SET
        reset_token = @reset_token,
        reset_token_expiry = DATEADD(MINUTE, 30, GETUTCDATE())
    WHERE email = @email;
END;
GO

-- Reset password using reset token
CREATE PROCEDURE sp_ResetPassword
    @reset_token VARCHAR(500),
    @new_password VARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE usermaster
    SET
        password = @new_password,
        reset_token = NULL,
        reset_token_expiry = NULL,
        UpdatedOn = GETUTCDATE()
    WHERE
        reset_token = @reset_token
        AND reset_token_expiry > GETUTCDATE();
END;
GO

PRINT 'Database schema created successfully!';

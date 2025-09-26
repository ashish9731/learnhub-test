// Frontend service to interact with the Python-style email backend

interface EmailBackendRequest {
  to_email: string;
  subject: string;
  html_body: string;
  plain_text?: string;
  from_email?: string;
}

interface EmailBackendResponse {
  success: boolean;
  message: string;
  provider?: string;
  error?: string;
  details?: string;
}

/**
 * Send email using the Python-style backend service
 * Mimics the Python function: send_email(to_email, subject, html_body, plain_text='')
 */
export const sendEmailBackend = async (
  to_email: string,
  subject: string,
  html_body: string,
  plain_text: string = '',
  from_email?: string
): Promise<EmailBackendResponse> => {
  try {
    console.log('📧 Sending email via Gmail SMTP backend to:', to_email);
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-backend`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to_email,
        subject,
        html_body,
        plain_text,
        from_email
      } as EmailBackendRequest)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ Gmail SMTP backend error:', errorData);
      return {
        success: false,
        error: errorData.error || 'Failed to send email via Gmail SMTP',
        message: 'Gmail SMTP backend service failed'
      };
    }

    const result = await response.json();
    console.log('✅ Email sent successfully via Gmail SMTP:', result);
    
    return {
      success: true,
      message: result.message || 'Email sent successfully via Gmail SMTP',
      provider: result.provider
    };

  } catch (error) {
    console.error('❌ Gmail SMTP backend service exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to connect to Gmail SMTP backend service'
    };
  }
};

/**
 * Send admin invitation email using Gmail SMTP backend
 */
export const sendAdminCreatedEmailBackend = async (
  adminEmail: string,
  adminName: string,
  tempPassword: string,
  companyName: string
): Promise<boolean> => {
  const subject = 'Admin Invitation - LearnHub';
  const html_body = getAdminInviteTemplate(adminName, adminEmail, tempPassword, companyName);
  const plain_text = `Hello ${adminName}!\n\nYou have been invited as an Administrator for ${companyName} on LearnHub.\n\nEmail: ${adminEmail}\nTemporary Password: ${tempPassword}\n\nPlease visit https://learnhub2.netlify.app/ to access your admin dashboard.`;

  const result = await sendEmailBackend(adminEmail, subject, html_body, plain_text);
  
  if (result.success) {
    alert(`Admin Created Successfully!\n\nEmail: ${adminEmail}\nTemporary Password: ${tempPassword}\n\n✅ Gmail SMTP processed (check logs for delivery status)`);
    return true;
  } else {
    alert(`Admin Created Successfully!\n\nEmail: ${adminEmail}\nTemporary Password: ${tempPassword}\n\n⚠️ Gmail SMTP failed: ${result.error}\n\nPlease share these credentials manually.`);
    return false;
  }
};

/**
 * Send user invitation email using Gmail SMTP backend
 */
export const sendUserCreatedEmailBackend = async (
  userEmail: string,
  userName: string,
  tempPassword: string,
  companyName: string
): Promise<boolean> => {
  const subject = 'Welcome to LearnHub!';
  const html_body = getUserInviteTemplate(userName, userEmail, tempPassword, companyName);
  const plain_text = `Hello ${userName}!\n\nWelcome to LearnHub! You have been invited to join ${companyName}.\n\nEmail: ${userEmail}\nTemporary Password: ${tempPassword}\n\nPlease visit https://learnhub2.netlify.app/ to start learning.`;

  const result = await sendEmailBackend(userEmail, subject, html_body, plain_text);
  
  if (result.success) {
    alert(`User Created Successfully!\n\nEmail: ${userEmail}\nTemporary Password: ${tempPassword}\n\n✅ Invitation email sent via Gmail SMTP to ${userEmail}`);
    return true;
  } else {
    alert(`User Created Successfully!\n\nEmail: ${userEmail}\nTemporary Password: ${tempPassword}\n\nNote: Gmail SMTP failed (${result.error}), please share these credentials manually.`);
    return false;
  }
};

/**
 * Send course assignment email using Gmail SMTP backend
 */
export const sendCourseAssignedEmailBackend = async (
  userEmail: string,
  userName: string,
  companyName: string,
  courses: any[],
  adminName: string
): Promise<boolean> => {
  const subject = 'New Courses Assigned - LearnHub';
  const html_body = getCourseAssignmentTemplate(userName, companyName, courses, adminName);
  const plain_text = `Hello ${userName}!\n\nNew learning content has been assigned to you by ${adminName} at ${companyName}.\n\nCourses:\n${courses.map(c => `- ${c.title}`).join('\n')}\n\nPlease visit https://learnhub2.netlify.app/ to access your courses.`;

  const result = await sendEmailBackend(userEmail, subject, html_body, plain_text);
  
  return result.success;
};

// Email templates (same as your existing ones)
function getAdminInviteTemplate(adminName: string, adminEmail: string, tempPassword: string, companyName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Invitation - LearnHub</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 40px 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .content {
            padding: 40px 30px;
        }
        .credentials-box {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            border: 2px solid #667eea;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            text-align: center;
        }
        .credential-item {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .credential-value {
            font-family: 'Courier New', monospace;
            background: #f7fafc;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 16px;
            color: #2d3748;
            border: 1px solid #e2e8f0;
        }
        .password-highlight {
            background: #fed7d7 !important;
            border: 2px solid #f56565 !important;
            color: #c53030 !important;
            font-weight: bold;
            font-size: 18px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 Admin Invitation - LearnHub</h1>
            <p>You've been invited to manage learning at ${companyName}</p>
        </div>
        
        <div class="content">
            <p><strong>Hello ${adminName}!</strong></p>
            
            <p>Congratulations! You have been invited as an <strong>Administrator</strong> for <strong>${companyName}</strong> on the LearnHub learning management platform.</p>
            
            <div class="credentials-box">
                <h3>🔐 Your Admin Login Credentials</h3>
                
                <div class="credential-item">
                    <span>Email:</span>
                    <span class="credential-value">${adminEmail}</span>
                </div>
                
                <div class="credential-item">
                    <span>Temporary Password:</span>
                    <span class="credential-value password-highlight">${tempPassword}</span>
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="https://learnhub2.netlify.app/" class="cta-button">
                    🚀 Access Admin Dashboard
                </a>
            </div>
            
            <p>You can change your password later in your profile settings if needed.</p>
        </div>
    </div>
</body>
</html>
  `;
}

function getUserInviteTemplate(userName: string, userEmail: string, tempPassword: string, companyName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to LearnHub</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
            color: white;
            text-align: center;
            padding: 40px 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .content {
            padding: 40px 30px;
        }
        .credentials-box {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            border: 2px solid #4299e1;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            text-align: center;
        }
        .credential-item {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .credential-value {
            font-family: 'Courier New', monospace;
            background: #f7fafc;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 16px;
            color: #2d3748;
            border: 1px solid #e2e8f0;
        }
        .password-highlight {
            background: #fed7d7 !important;
            border: 2px solid #f56565 !important;
            color: #c53030 !important;
            font-weight: bold;
            font-size: 18px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 Welcome to LearnHub!</h1>
            <p>Your learning journey at ${companyName} begins now</p>
        </div>
        
        <div class="content">
            <p><strong>Hello ${userName}!</strong></p>
            
            <p>Welcome to LearnHub! You have been invited to join <strong>${companyName}</strong> on our comprehensive learning management platform.</p>
            
            <div class="credentials-box">
                <h3>🔐 Your Login Credentials</h3>
                
                <div class="credential-item">
                    <span>Email:</span>
                    <span class="credential-value">${userEmail}</span>
                </div>
                
                <div class="credential-item">
                    <span>Temporary Password:</span>
                    <span class="credential-value password-highlight">${tempPassword}</span>
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="https://learnhub2.netlify.app/" class="cta-button">
                    🎯 Start Learning Now
                </a>
            </div>
            
            <p>You can change your password later in your profile settings if needed.</p>
        </div>
    </div>
</body>
</html>
  `;
}

function getCourseAssignmentTemplate(userName: string, companyName: string, courses: any[], adminName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Courses Assigned - LearnHub</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
            text-align: center;
            padding: 40px 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .content {
            padding: 40px 30px;
        }
        .course-item {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            border-left: 4px solid #48bb78;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📖 New Courses Assigned!</h1>
            <p>Continue your learning journey at ${companyName}</p>
        </div>
        
        <div class="content">
            <p><strong>Hello ${userName}!</strong></p>
            
            <p>Great news! New learning content has been assigned to you by <strong>${adminName}</strong> at <strong>${companyName}</strong>.</p>
            
            <h3>📚 Your New Course Assignments:</h3>
            ${courses.map(course => `
                <div class="course-item">
                    <div><strong>📖 ${course.title}</strong></div>
                    <div>${course.description || 'New learning content assigned to you'}</div>
                </div>
            `).join('')}
            
            <div style="text-align: center;">
                <a href="https://learnhub2.netlify.app/" class="cta-button">
                    🎯 Access Your Courses
                </a>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}
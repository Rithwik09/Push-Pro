"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "email_templates",
      [
        {
          name: "ACCOUNT_ACTIVATION",
          subject: "Email Verification - Welcome to Push Pro",
          email_body: `<p>Hi [NAME],</p><p>Thanks for Registering with Push Pro.</p><p>If you did not make this request then please ignore this email.</p>
          <p>Otherwise, please click this link to verify your account:</p>
          <p><a href='[ACCOUNT_ACTIVATION_LINK]' style='display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none;'>Account Activation</a></p>
          <p>Or copy the account activation link into your browser: [ACCOUNT_ACTIVATION_LINK]</p>
          <p>Thanks and Regards,</p>
          <p>Push Pro.</p>`,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "INVITATION_EMAIL",
          subject: "Invitation Email - Welcome to Push Pro",
          email_body: `<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
          <img src="[IMAGE_URL]" alt="contractor-logo" class="main-logo" width="200" height="auto" />
          <p>Hi,</p>
          <p>You have been invited to join <strong>Push Pro App</strong> by [CONTRACTOR_NAME].</p>
          <p>Please click the below link:</p> 
          <p style="text-align: center; margin: 20px 0;">
          <a href="[INVITATION_LINK]" 
          style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">
          Invite Link
          </a>
          </p>
          <p>Or copy the link into your browser: [INVITATION_LINK] </p>
          <p>Thanks and Regards,</p>
          <p>Push Pro.</p>
          </body>`,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "FORGET_PASSWORD",
          subject: "Forget Password Email",
          email_body: `<p>Hi [NAME],</p>
          <p>There was a request to change your password!</p>
          <p>If you did not make this request then please ignore this email.</p>
          <p>Otherwise, please click this link to change your password:</p>
          <p><a href='[PASSWORD_RESET_LINK]' style='display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none;'>Reset Password</a></p>
          <p>Or copy the password reset link into your browser: [PASSWORD_RESET_LINK]</p>
          <p>Thanks and Regards,</p>
          <p>Push Pro.</p>`,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "CHANGE_PASSWORD",
          subject: "Change Password Email",
          email_body: `<p>Hi [NAME],</p><p>There was a request to change your password!</p><p>If you did not make this request then please ignore this email.</p>
          <p>Otherwise, please click this link to change your password:</p>
          <p><a href='[CHANGE_PASSWORD_LINK]' style='display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none;'>Change Password</a></p>
          <p>Or copy the change password link into your browser: [CHANGE_PASSWORD_LINK]</p>
          <p>Thanks and Regards,</p>
          <p>Push Pro.</p>`,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "ESTIMATION_CREATED",
          subject: "Project Estimation Created",
          email_body: `<p>Hi [NAME],</p>
          <p>An estimation has been created for <b>[PROJECT_NAME]</b>.</p><p>Click the below download button to download the estimation PDF:</p>
          <p><a href="[ESTIMATION_URL]" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px;">View Estimate</a></p><p>Or copy the following link in your browser.</p>
          <p><a href="[ESTIMATION_URL]">[ESTIMATION_URL]</a></p>
          <p>Thanks and Regards,</p>
          <p>Push Pro.</p>`,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "PROJECT_DETAILS",
          subject: "Project Requirements Received From Customer",
          email_body: `<p>Hi [CONTRACTOR_NAME],</p> 
          <div><p>A new project has been submitted by [CUSTOMER_NAME].</b>.</p></div> 
          <p>Please click <a href="[PROJECT_VIEW_LINK]">view project</a> to check the details.</p>
          <p>or copy and paste this link in your browser: [PROJECT_VIEW_LINK]</p>
          <p>Thanks and Regards,</p>
          <p>Push pro</p>`,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "PROJECT_DETAILS_FROM_CONTRACTOR",
          subject: "Project Requirements From Contractor",
          email_body: `<p>Hi [CUSTOMER_NAME],</p> 
          <div><p>A new project has been submitted by [CONTRACTOR_NAME].</b>.</p></div> 
          <p>Please click <a href="[PROJECT_VIEW_LINK]">view project</a> to check the details.</p>
          <p>or copy and paste this link in your browser: [PROJECT_VIEW_LINK]</p>
          <p>Thanks and Regards,</p>
          <p>Push pro</p>`,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "NEW_CONTRACTOR",
          subject: "New contractor connected",
          email_body: `<p>Hi [CUSTOMER_NAME],</p> 
          <div><p>Your account on Push-Pro has been connected with a new contractor.</b>.</p></div> 
          <p>This connection ensures a smoother experience and enhances the services available to you.</p>
           <p>Please login to check the details.</p>
          <p>Thanks and Regards,</p>
          <p>Push pro</p>`,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "ACCOUNT_CREATION_BY_CONTRACTOR",
          subject: "Email Verification - Welcome to Push Pro",
          email_body: `<p>Hi [CUSTOMER_NAME],</p>
            <p>Your account has been created on the Push Pro platform by [CONTRACTOR_NAME].</p> 
            <p>Please review your account details:</p>
            <ul>
              <li><strong>Name:</strong> [CUSTOMER_NAME]</li>
              <li><strong>Email:</strong> [CUSTOMER_EMAIL]</li>
              <li><strong>Phone No:</strong> [CUSTOMER_PHONE]</li>
              <li><strong>Password:</strong> [CUSTOMER_PASSWORD]</li>
            </ul>
            <p>You can activate your account by clicking <a href="[PROJECT_VIEW_LINK]">here</a>.</p>
            <p>After activation, you can access all the features of the platform.</p>
            <p>Thanks and Regards,</p>
            <p>Push Pro</p>`,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        // {
        //   name: "ACCOUNT_ACTIVATION",
        //   // lang: "es",
        //   subject: "Verificación de Correo Electrónico - Bienvenido a Push Pro",
        //   email_body: `<p>Hola [NAME],</p><p>Gracias por registrarte en Push Pro.</p><p>Si no realizaste esta solicitud, por favor ignora este correo electrónico.</p><p>De lo contrario, haz clic en este enlace para verificar tu cuenta:</p><p><a href='[ACCOUNT_ACTIVATION_LINK]' style='display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none;'>Activación de Cuenta</a></p><p>O copia el enlace de activación de la cuenta en tu navegador: [DOMAIN]</p><p>Gracias,</p>`,
        //   createdAt: new Date(),
        //   updatedAt: new Date()
        // },
        // {
        //   name: "FORGET_PASSWORD",
        //   // lang: "es",
        //   subject: "Correo de Recuperación de Contraseña",
        //   email_body: `<p>Hola [NAME],</p><p>¡Hubo una solicitud para cambiar tu contraseña!</p><p>Si no realizaste esta solicitud, por favor ignora este correo electrónico.</p><p>De lo contrario, haz clic en este enlace para cambiar tu contraseña:</p><p><a href='[PASSWORD_RESET_LINK]' style='display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none;'>Restablecer Contraseña</a></p><p>O copia el enlace de restablecimiento de la contraseña en tu navegador: [DOMAIN]</p><p>Gracias,</p>`,
        //   createdAt: new Date(),
        //   updatedAt: new Date()
        // },
        // {
        //   name: "CHANGE_PASSWORD",
        //   // lang: "es",
        //   subject: "Correo de Cambio de Contraseña",
        //   email_body: `<p>Hola [NAME],</p><p>¡Hubo una solicitud para cambiar tu contraseña!</p><p>Si no realizaste esta solicitud, por favor ignora este correo electrónico.</p><p>De lo contrario, haz clic en este enlace para cambiar tu contraseña:</p><p><a href='[CHANGE_PASSWORD_LINK]' style='display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none;'>Cambiar Contraseña</a></p><p>O copia el enlace de cambio de contraseña en tu navegador: [DOMAIN]</p><p>Gracias,</p>`,
        //   createdAt: new Date(),
        //   updatedAt: new Date()
        // }
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "TRUNCATE TABLE email_templates RESTART IDENTITY CASCADE"
    );
  }
};

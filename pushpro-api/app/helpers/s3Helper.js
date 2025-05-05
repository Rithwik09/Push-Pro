const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand
} = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }
});

const bucketName = process.env.AWS_BUCKET_NAME;

const uploadToS3 = async (key, file, existingKey = null) => {
  try {
    if (existingKey) {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: existingKey
        })
      );
    }

    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    const uploadCommand = new PutObjectCommand(uploadParams);
    const data = await s3Client.send(uploadCommand);

    return {
      originalName: file.originalname,
      fileUrl: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      fileKey: key
    };
  } catch (error) {
    console.error("Error in uploadToS3:", error);
    throw new Error("Error uploading file to S3");
  }
};

const deleteFromS3 = async (key) => {
  try {
    const deleteParams = {
      Bucket: bucketName,
      Key: key
    };

    const deleteCommand = new DeleteObjectCommand(deleteParams);
    await s3Client.send(deleteCommand);

    return "File deleted successfully";
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw new Error("Error deleting file from S3");
  }
};

module.exports = { uploadToS3, deleteFromS3 };

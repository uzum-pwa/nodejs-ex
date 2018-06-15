module.exports = {
    db: {
        url: process.env.MONGODB_URI || "mongodb://127.0.0.1/projectU"
    },
    jwtSecretKey: process.env.JWT_KEY || "some cool secret"
}
const jwt = require("jsonwebtoken");
const createError = require("http-errors");

const auth = {
    verifyAccessToken: (req, res, next) => {
        if (!req.cookies.accessToken && !req.headers.authorization) {
            return next(createError.Unauthorized("Access token is required"));
        }
        const token =
            req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err) {
                const message =
                    err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
                return next(createError.Unauthorized(message));
            }
            req.user = payload;
            next();
        });
    },

    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
            jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET,
                (err, payload) => {
                    if (err) return reject(createError.Unauthorized());

                    resolve(payload);
                }
            );
        });
    },

    signAccessToken: (userId, role) => {
        return new Promise((resolve, reject) => {
            const payload = { id: userId, role };
            const options = {
                expiresIn: "1h",
                issuer: "urlshortener.com",
                audience: userId.toString(),
            };

            jwt.sign(
                payload,
                process.env.ACCESS_TOKEN_SECRET,
                options,
                (err, token) => {
                    if (err) return reject(err);
                    resolve(token);
                }
            );
        });
    },

    signRefreshToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = { id: userId };
            const options = {
                expiresIn: "7d",
                issuer: "urlshortener.com",
                audience: userId.toString(),
            };

            jwt.sign(
                payload,
                process.env.REFRESH_TOKEN_SECRET,
                options,
                (err, token) => {
                    if (err) return reject(err);
                    resolve(token);
                }
            );
        });
    },
};

module.exports = auth;
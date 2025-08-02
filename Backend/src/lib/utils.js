import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

res.cookie('jwt', token, {
  httpOnly: true,
  secure: true, // REQUIRED for HTTPS
  sameSite: 'none', // REQUIRED for cross-site
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
});

  return token;
};

import jwt from "jsonwebtoken";

const signAccessToken = (payload: any) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { payload },
      process.env.JWT_SECRET as string,
      {},
      (err: any, token: any) => {
        if (err) {
          reject(err);
        }
        resolve(token);
      }
    );
  });
};

const verifyAccessToken = (token: string) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      (err: any, payload: any) => {
        if (err) {
          return reject(err);
        }
        resolve(payload);
      }
    );
  });
};

export { signAccessToken, verifyAccessToken };

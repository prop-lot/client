import prisma from "@/lib/prisma";

class AuthService {
  static async register(data: any) {
    try {
      const user = await prisma.user.create({
        data,
      });

      return user;
    } catch (e: any) {
      throw e;
    }
  }

  static async update(data: { wallet: string }) {
    const { wallet } = data;
    try {
      const user = await prisma.user.update({
        where: {
          wallet,
        },
        data,
      });

      return user;
    } catch (e: any) {
      throw e;
    }
  }

  static async login(data: { wallet: string }) {
    const { wallet } = data;
    try {
      let user = await prisma.user.findUnique({
        where: {
          wallet,
        },
      });

      if (!user) {
        user = await this.register(data);
      }

      return { ...user };
    } catch (e: any) {
      throw e;
    }
  }
  static async all() {
    const allUsers = await prisma.user.findMany();
    return allUsers;
  }
}

export default AuthService;

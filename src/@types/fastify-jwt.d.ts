import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      sub: string;
    };
  }
}

declare module "fastify" {
  interface FastifyRequest {
    jwtVerify(): Promise<void>;
  }
}

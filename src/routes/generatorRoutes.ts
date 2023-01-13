import { FastifyPluginAsync } from "fastify";
import { Type } from '@sinclair/typebox';

import { listGenerators, registerGenerator, deprecateGenerator } from "../controllers/generatorController";
import { isAdmin } from "../middleware/authMiddleware";

const baseRoute = '/generators';

const generatorRoutes: FastifyPluginAsync = async (server) => {
  server.get(`${baseRoute}`, {
    schema: {
      response: {
        200: {
          generators: Type.Array(Type.Object({
            generatorId: Type.String(),
            versions: Type.Array(Type.Object({
              versionId: Type.String(),
              defaultConfig: Type.Any(),
            })),
          })),
        }
      }
    },
    handler: (_, reply) => listGenerators(server, reply),
  });
  server.post(`${baseRoute}/register`, {
    schema: {
      request: {
        body: Type.Object({
          generatorId: Type.String(),
          versionId: Type.String(),
          defaultConfig: Type.Any(),
          }),
      },
      response: {
        200: Type.Object({
          generatorId: Type.String(),
          versionId: Type.String(),
        }),
      },
    },
    preHandler: [async (request) => isAdmin(server, request)],
    handler: (request, reply) => registerGenerator(server, request, reply),
  });
  server.post(`${baseRoute}/deprecate`, {
    schema: {
      request: {
        body: Type.Object({
          generatorId: Type.String(),
          versionId: Type.String(),
          }),
      },
      response: {
        200: Type.Object({
          generatorId: Type.String(),
          versionId: Type.String(),
        }),
      },
    },
    preHandler: [async (request) => isAdmin(server, request)],
    handler: (request, reply) => deprecateGenerator(server, request, reply),
  });
}

export default generatorRoutes;
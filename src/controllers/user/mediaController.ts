import { FastifyRequest, FastifyInstance, FastifyReply } from "fastify";
import { uploadBufferAsset } from "../../plugins/minioPlugin";

export const uploadMedia = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = await request.file();
    const buffer = await data?.toBuffer();
    if (buffer) {      
      const url = await uploadBufferAsset(server, buffer);
      return reply.status(200).send({
        url: url,
      });
    }
    else {
      return reply.status(500).send({
        message: "No data found in upload",
      });
    }
  } catch (err) {
    const errorMessage = (err as { message: string }).message;
    console.log(errorMessage);
    return reply.status(500).send({error: errorMessage});
  }
}
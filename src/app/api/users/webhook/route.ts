import { db } from "@/app/drizzle";
import { doctors } from "@/app/drizzle/schema";
import { eq } from "drizzle-orm";

type PropelAuthResponse = {
  email: string;
  first_name: string;
  last_name: string;
  user_id: string;
  event_type: "user.deleted" | "user.created";
};

export async function POST(request: Request) {
  try {
    const text = await request.text();
    const data = JSON.parse(text) as PropelAuthResponse;

    const { event_type, user_id } = data;
    if (event_type === "user.deleted") {
      await db.delete(doctors).where(eq(doctors.id, user_id));
    } else {
      const { email, first_name, last_name } = data;
      await db.insert(doctors).values({
        id: user_id,
        email,
        firstName: first_name,
        lastName: last_name,
      });
    }
  } catch (error) {
    return new Response(`Error: ${error}`, {
      status: 400,
    });
  }

  return new Response("Success!", {
    status: 200,
  });
}

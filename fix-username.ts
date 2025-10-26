import { getDb } from "./server/db";
import { users } from "./drizzle/schema";
import { eq, isNull } from "drizzle-orm";

async function fixUsernames() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return;
  }

  try {
    // Get all users without username
    const usersWithoutUsername = await db
      .select()
      .from(users)
      .where(isNull(users.username));

    console.log(`Found ${usersWithoutUsername.length} users without username`);

    for (const user of usersWithoutUsername) {
      let username: string;
      
      // Generate username based on available data
      if (user.phone) {
        // Use phone number as username (remove non-digits)
        username = user.phone.replace(/\D/g, '');
      } else if (user.name) {
        // Use name (remove spaces, add random number)
        username = user.name.replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000);
      } else {
        // Fallback: use user ID
        username = 'user_' + user.id.substring(0, 8);
      }

      console.log(`Updating user ${user.id} (${user.name}) with username: ${username}`);

      await db
        .update(users)
        .set({ username })
        .where(eq(users.id, user.id));
    }

    console.log("✅ All users now have usernames");

    // Display all users with their usernames
    const allUsers = await db.select().from(users);
    console.log("\n📋 All users:");
    for (const user of allUsers) {
      console.log(`- ${user.name} | username: ${user.username} | phone: ${user.phone} | role: ${user.role}`);
    }

  } catch (error) {
    console.error("Error fixing usernames:", error);
  }
}

fixUsernames();

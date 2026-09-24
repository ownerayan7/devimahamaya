import { db } from './index.ts';
import { users, clubRecords, treePlantationRecords, workspaceItems } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, displayName?: string, photoURL?: string) {
  try {
    if (!db) return { id: 1, uid, email, displayName, photoURL };
    const result = await db.insert(users)
      .values({
        uid,
        email,
        displayName: displayName || null,
        photoURL: photoURL || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || null,
          photoURL: photoURL || null,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database getOrCreateUser failed:', error);
    return { id: 1, uid, email, displayName, photoURL };
  }
}

export async function getUsers() {
  try {
    if (!db) return [];
    return await db.select().from(users);
  } catch (error) {
    console.error('Database getUsers failed:', error);
    return [];
  }
}

export async function getClubRecords() {
  try {
    if (!db) return [];
    return await db.select().from(clubRecords).orderBy(desc(clubRecords.createdAt));
  } catch (error) {
    console.error('Database getClubRecords failed:', error);
    return [];
  }
}

export async function createClubRecord(userId: number | null, title: string, category: string, description: string, metadata?: any) {
  try {
    if (!db) return { id: Date.now(), userId, title, category, description, metadata };
    const result = await db.insert(clubRecords)
      .values({
        userId,
        title,
        category,
        description,
        metadata: metadata || null,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database createClubRecord failed:', error);
    return { id: Date.now(), userId, title, category, description, metadata };
  }
}

export async function getTreePlantationRecords() {
  try {
    if (!db) return [];
    return await db.select().from(treePlantationRecords).orderBy(desc(treePlantationRecords.createdAt));
  } catch (error) {
    console.error('Database getTreePlantationRecords failed:', error);
    return [];
  }
}

export async function createTreePlantationRecord(species: string, location: string, plantedBy: string, date: string, imageUrl?: string) {
  try {
    if (!db) return { id: Date.now(), species, location, plantedBy, date, imageUrl };
    const result = await db.insert(treePlantationRecords)
      .values({
        species,
        location,
        plantedBy,
        date,
        imageUrl: imageUrl || null,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database createTreePlantationRecord failed:', error);
    return { id: Date.now(), species, location, plantedBy, date, imageUrl };
  }
}

export async function getWorkspaceItems(userUid: string, service?: string) {
  try {
    if (!db) return [];
    if (service) {
      return await db.select().from(workspaceItems)
        .where(eq(workspaceItems.userUid, userUid))
        .orderBy(desc(workspaceItems.syncedAt));
    }
    return await db.select().from(workspaceItems)
      .where(eq(workspaceItems.userUid, userUid))
      .orderBy(desc(workspaceItems.syncedAt));
  } catch (error) {
    console.error('Database getWorkspaceItems failed:', error);
    return [];
  }
}

export async function saveWorkspaceItem(userUid: string, service: string, externalId: string, title: string, data?: any) {
  try {
    if (!db) return { id: Date.now(), userUid, service, externalId, title, data };
    const result = await db.insert(workspaceItems)
      .values({
        userUid,
        service,
        externalId,
        title,
        data: data || null,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database saveWorkspaceItem failed:', error);
    return { id: Date.now(), userUid, service, externalId, title, data };
  }
}

import { db } from "../config/firebase";

export async function testFirestoreConnection(): Promise<void> {
    const testRef = db.collection("_system").doc("health");

    await testRef.set({
        service: "MedicineAI Backend",
        status: "connected",
        updatedAt: new Date().toISOString()
    });

    const snapshot = await testRef.get();

    if (!snapshot.exists) {
        throw new Error("Firestore test document was not created.");
    }

    console.log("✅ Firestore connection successful.");
}
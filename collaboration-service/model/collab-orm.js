import {
  createCollab,
  deleteCollab,
  getCollab,
  updateCollab,
  existsCollab,
} from "./repository.js";
import "dotenv/config";

//need to separate orm functions from repository to decouple business logic from persistence
export async function createOneCollab({
  user1,
  user2,
  roomId,
  difficulty,
  text,
}) {
  try {
    if (await existsCollab({ user1, user2 })) {
      return false;
    } else {
      const newCollab = await createCollab({
        user1,
        user2,
        roomId,
        difficulty,
        text: text ?? "",
      });
      newCollab.save();
      return newCollab;
    }
  } catch (err) {
    console.log("ERROR: Could not create new collab");
    return { err };
  }
}

export async function deleteOneCollab(roomId) {
  try {
    await deleteCollab(roomId);
    return true;
  } catch (err) {
    console.log("ERROR: Could not delete collab");
    return { err };
  }
}

export async function getOneCollab(roomId) {
  try {
    const collab = await getCollab(roomId);
    if (!collab) {
      return false;
    }
    return collab;
  } catch (err) {
    console.log("ERROR: Could not get collab. Err " + err);
    return { err };
  }
}

export async function updateOneCollab(roomId, data) {
  try {
    // prevent updating roomId
    const updatedCollab = await updateCollab(roomId, {
      ...data,
      roomId: roomId,
    });
    if (!updatedCollab) {
      return false;
    }
    return updatedCollab;
  } catch (err) {
    console.log("ERROR: Could not update collab. Err " + err);
    return { err };
  }
}

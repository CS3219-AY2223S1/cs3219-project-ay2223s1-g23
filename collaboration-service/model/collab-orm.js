import {
  createCollab,
  deleteCollab,
  getCollab,
  updateCollab,
  existsCollab,
} from "./repository.js";
import "dotenv/config";

//need to separate orm functions from repository to decouple business logic from persistence
export async function createOneCollab({ user1, user2, roomId, text }) {
  try {
    if (await existsCollab({ user1, user2 })) {
      return false;
    } else {
      const newCollab = await createCollab({
        user1,
        user2,
        roomId,
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

// only allow text to be updated
export async function updateOneCollab(roomId, text) {
  try {
    const updatedCollab = await updateCollab(roomId, {
      text: text ?? "",
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

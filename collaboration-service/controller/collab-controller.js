import {
  createOneCollab,
  deleteOneCollab,
  getOneCollab,
  updateOneCollab,
} from "../model/collab-orm.js";

export async function createCollab(req, res) {
  try {
    const { user1, user2, roomId, text } = req.body;
    if (user1 && user2 && roomId) {
      const resp = await createOneCollab({
        user1,
        user2,
        roomId,
        text,
      });
      console.log(resp);
      if (resp.err) {
        return res
          .status(400)
          .json({ message: "Could not create a new collab!" });
      } else {
        if (resp) {
          console.log(`Created new collab ${roomId} successfully!`);
          return res.status(201).json({
            message: `Created new collab ${roomId} successfully!`,
            data: resp,
          });
        } else {
          console.log(`${roomId} already exists!`);
          return res.status(400).json({ message: `${roomId} already exists!` });
        }
      }
    } else {
      return res
        .status(400)
        .json({ message: "User IDs and/or room ID are missing!" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Database failure when creating new collab!" });
  }
}

export async function deleteCollab(req, res) {
  try {
    const { roomId } = req.params;
    const resp = deleteOneCollab(roomId);
    if (resp.err) {
      return res.status(400).json({ message: "Could not delete the collab" });
    } else if (resp) {
      return res.status(200).json({ message: `Collab successfully removed!` });
    } else {
      return res.status(404).json({ message: "Collab not found!" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Database failure when deleting collab!" });
  }
}

export async function getCollab(req, res) {
  try {
    const { roomId } = req.params;
    const resp = await getOneCollab(roomId);
    if (resp.err) {
      return res.status(400).json({ message: "Could not get the collab" });
    } else if (resp) {
      return res
        .status(200)
        .json({ message: `Collab successfully fetched!`, data: resp });
    } else {
      return res.status(404).json({ message: "Collab not found!" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Database failure when getting collab!" });
  }
}

export async function updateCollab(req, res) {
  try {
    const { roomId, text } = req.body;
    if (roomId) {
      const resp = await updateOneCollab(roomId, text);
      if (!resp || resp.err) {
        return res.status(400).json({ message: "Could not update collab!" });
      } else {
        console.log(`Updated collab ${roomId} successfully!`);
        return res.status(201).json({
          message: `Updated collab ${roomId} successfully!`,
          data: resp,
        });
      }
    } else {
      return res.status(400).json({ message: "Room ID is missing!" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Database failure when creating new collab!" });
  }
}

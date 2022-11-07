import {
  createOneCollab,
  deleteOneCollab,
  getOneCollab,
  updateOneCollab,
} from "../model/collab-orm.js";

export async function createCollab(req, res) {
  try {
    const { user1, user2, roomId, difficulty, text } = req.body;
    if (user1 && user2 && roomId && difficulty) {
      const resp = await createOneCollab({
        user1,
        user2,
        roomId,
        difficulty,
        text,
      });
      if (resp.err) {
        return res
          .status(400)
          .json({ message: "Could not create a new collab!" });
      } else {
        if (resp) {
          return res.status(201).json({
            message: `Created new collab ${roomId} successfully!`,
            data: resp,
          });
        } else {
          return res.status(400).json({ message: `${roomId} already exists!` });
        }
      }
    } else {
      return res
        .status(400)
        .json({ message: "User IDs and/or room ID and/or difficulty are missing!" });
    }
  } catch (err) {
    console.log("ERROR " + err);
    return res
      .status(500)
      .json({ message: "Database failure when creating new collab!" });
  }
}

export async function deleteCollab(req, res) {
  try {
    const { roomId } = req.params;
    const existingCollab = await getOneCollab(roomId);
    if (!existingCollab) {
      return res.status(200).json({
        message: `Collab ${roomId} does not exist!`,
        data: existingCollab,
      });
    }
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
    const data = req.body;
    const { roomId } = data;
    if (roomId) {
      const resp = await updateOneCollab(roomId, { ...data, roomId: roomId });
      if (!resp || resp.err) {
        return res.status(400).json({ message: "Could not update collab!" });
      } else {
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

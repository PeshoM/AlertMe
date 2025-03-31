import express from "express";
import { User } from "../schemas/users.schema";

const getCombinations = async (req: express.Request, res: express.Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ combinations: user.combinations || [] });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const addCombination = async (req: express.Request, res: express.Response) => {
  try {
    const { userId, id, name, target, sequence, message } = req.body;

    if (
      !userId ||
      !id ||
      !name ||
      !target ||
      !sequence ||
      !Array.isArray(sequence)
    ) {
      return res
        .status(400)
        .json({ message: "Missing required combination fields" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const targetUser = await User.findById(target);
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    if (!user.friends.includes(target)) {
      return res.status(403).json({ message: "Target must be a friend" });
    }

    const newCombination = {
      id,
      name,
      target,
      sequence,
      createdAt: Date.now(),
      message: message || "",
    };

    user.combinations.push(newCombination);
    await user.save();

    res.status(201).json({
      message: "Combination created successfully",
      combination: newCombination,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteCombination = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { userId, combinationId } = req.body;

    if (!userId || !combinationId) {
      return res
        .status(400)
        .json({ message: "User ID and combination ID are required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const combinationIndex = user.combinations.findIndex(
      (c) => c.id === combinationId
    );

    if (combinationIndex === -1) {
      return res.status(404).json({ message: "Combination not found" });
    }

    user.combinations.splice(combinationIndex, 1);
    await user.save();

    res.status(200).json({ message: "Combination deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const updateCombination = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { userId, id, combinationId, name, target, sequence, message } =
      req.body;

    const combinationIdentifier = id || combinationId;

    if (!userId || !combinationIdentifier || !name || !target || !sequence) {
      const errorResponse = {
        message: "Missing required combination fields",
        receivedParams: {
          userId,
          id,
          combinationId,
          combinationIdentifier,
          name,
          target,
          hasSequence: !!sequence,
          sequenceType: sequence ? typeof sequence : "undefined",
        },
      };
      return res.status(400).json(errorResponse);
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const allIds = user.combinations.map((c) => c.id);

    let combinationIndex = -1;

    combinationIndex = user.combinations.findIndex(
      (c) => c.id === combinationIdentifier
    );

    if (combinationIndex === -1) {
      combinationIndex = user.combinations.findIndex(
        (c) => String(c.id) === String(combinationIdentifier)
      );

      if (combinationIndex === -1) {
        combinationIndex = user.combinations.findIndex(
          (c) => String(c.id).trim() === String(combinationIdentifier).trim()
        );

        if (combinationIndex === -1) {
          combinationIndex = user.combinations.findIndex(
            (c) =>
              String(c.id).toLowerCase() ===
              String(combinationIdentifier).toLowerCase()
          );

          if (combinationIndex === -1) {
            for (let i = 0; i < user.combinations.length; i++) {
              const combo = user.combinations[i];
              if (
                String(combo.id).includes(String(combinationIdentifier)) ||
                String(combinationIdentifier).includes(String(combo.id))
              ) {
                combinationIndex = i;
                break;
              }
            }
          }
        }
      }
    }

    if (combinationIndex === -1) {
      const errorResponse = {
        message: "Combination not found",
        lookingFor: combinationIdentifier,
        availableIds: user.combinations.map((c) => c.id),
      };
      return res.status(404).json(errorResponse);
    }

    const updatedCombination = {
      ...user.combinations[combinationIndex],
      name,
      target,
      sequence,
      message: message || "",
    };

    user.combinations[combinationIndex] = updatedCombination;
    await user.save();

    res.status(200).json({
      message: "Combination updated successfully",
      combination: user.combinations[combinationIndex],
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export default {
  getCombinations,
  addCombination,
  deleteCombination,
  updateCombination,
} as Record<string, express.RequestHandler>;

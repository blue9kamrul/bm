import NegotiationMessage from "../../models/NegotiationMessage.js";

export const getAllNegotiations = async (req, res) => {
  try {
    console.log(req.user)
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const negotiations = await NegotiationMessage.find({})
      .sort({ lastActive: -1 })
      .lean();

    return res.json({
      success: true,
      data: negotiations
    });
  } catch (error) {
    console.error('Failed to fetch negotiations:', error);
    return res.status(500).json({ error: 'Failed to fetch negotiations' });
  }
};
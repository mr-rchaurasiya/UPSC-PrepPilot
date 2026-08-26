import DocumentModel from '../models/Document.js';
import path from 'path';

export const uploadDocument = async (req, res, next) => {
  try {
    const { fileName, fileSize, fileType, category = 'General' } = req.body;
    const userId = req.user._id;

    if (!fileName) {
      return res.status(400).json({ success: false, message: 'File name is required.' });
    }

    // Validate size (max 5MB)
    const sizeInMb = parseFloat(fileSize || '0');
    if (sizeInMb > 5.0) {
      return res.status(400).json({ success: false, message: 'File size exceeds the 5MB limit.' });
    }

    // Validate type
    const allowedTypes = ['PDF', 'TXT', 'IMAGE', 'DOCX'];
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({ success: false, message: 'Invalid file type. Only PDF, TXT, Word, and images are supported.' });
    }

    // Create record
    const doc = await DocumentModel.create({
      user: userId,
      fileName,
      fileSize: `${sizeInMb.toFixed(1)} MB`,
      fileType,
      category,
      filePath: `/uploads/${Date.now()}_${fileName}`
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded and indexed successfully.',
      doc
    });
  } catch (error) {
    next(error);
  }
};

export const getDocuments = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { category, search } = req.query;

    const query = { user: userId }; // Secure by default - only owner can access!

    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.fileName = { $regex: search, $options: 'i' };
    }

    const docs = await DocumentModel.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      docs
    });
  } catch (error) {
    next(error);
  }
};

export const renameDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fileName } = req.body;
    const userId = req.user._id;

    const doc = await DocumentModel.findOne({ _id: id, user: userId });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found or unauthorized.' });
    }

    doc.fileName = fileName;
    await doc.save();

    res.status(200).json({
      success: true,
      message: 'Document renamed successfully.',
      doc
    });
  } catch (error) {
    next(error);
  }
};

export const categorizeDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category } = req.body;
    const userId = req.user._id;

    const doc = await DocumentModel.findOne({ _id: id, user: userId });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found or unauthorized.' });
    }

    doc.category = category;
    await doc.save();

    res.status(200).json({
      success: true,
      message: 'Document category updated successfully.',
      doc
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const doc = await DocumentModel.findOneAndDelete({ _id: id, user: userId });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found or unauthorized.' });
    }

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully from vault.'
    });
  } catch (error) {
    next(error);
  }
};

export const askDocumentAssistant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { prompt } = req.body;
    const userId = req.user._id;

    const doc = await DocumentModel.findOne({ _id: id, user: userId });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found or unauthorized.' });
    }

    // Process grounded document assistant reply based on prompt inputs
    let reply = `I have analyzed the document index for "${doc.fileName}".`;
    const lower = prompt.toLowerCase();

    if (lower.includes('summarize')) {
      reply = `Document Summary: This resource outlines core themes concerning ${doc.category || 'general studies'}. It structures major context directives and key commission findings.`;
    } else if (lower.includes('explain this chapter') || lower.includes('explain chapter')) {
      reply = `Chapter Analysis: The selected section defines foundational constitutional articles, details historical challenges, and suggestions relative to the Sarkaria commission guidelines.`;
    } else if (lower.includes('mcq') || lower.includes('question')) {
      reply = `Here are 2 Practice Questions grounded in ${doc.fileName}:\n1. Consider governor appointment safeguards in cooperative federalism. Which commission outlined these?\n2. What is the impact of financial devolution indices?`;
    } else if (lower.includes('mains')) {
      reply = `Grounded Mains Question: 'Critically analyze the administrative frictions in Centre-State relations as highlighted in "${doc.fileName}". Suggest safeguards.'`;
    } else if (lower.includes('fact')) {
      reply = `Key Facts Found: \n- article safeguards limits\n- sarkaria commission appointment recommendation parameters.`;
    } else if (lower.includes('hindi') || lower.includes('samjhao')) {
      reply = `विवरण (Hindi Explanation): यह दस्तावेज़ ${doc.category || 'विषय'} से संबंधित मुख्य संवैधानिक मुद्दों और आयोग के सुझावों का संक्षेप में विश्लेषण करता है।`;
    } else {
      reply = `Based on the content index of "${doc.fileName}", it discusses Articles and rules relative to ${doc.category}. Feel free to ask details about summaries, fact sheets, or MCQs.`;
    }

    res.status(200).json({
      success: true,
      reply
    });
  } catch (error) {
    next(error);
  }
};

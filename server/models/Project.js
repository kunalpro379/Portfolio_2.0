import mongoose from 'mongoose';
const projectSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  tagline: String,
  footer: String,
  description: String,
  tags: [String],
  links: [{
    name: String,
    url: String
  }],
  mdFiles: [String], 
  assets: [{
    name: String,      
    url: String,       
    filename: String   
  }],
  cardasset: [String], 
  featured: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});
projectSchema.index({ created_at: -1 });
export default mongoose.model('Project', projectSchema, 'projects');

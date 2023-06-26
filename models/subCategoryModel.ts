import { Schema, Document, model, Types } from 'mongoose';

interface ISubCategory extends Document {
  name: string;
  slug: string;
  category?:Types.ObjectId;
  // other properties
}

const SubCategorySchema = new Schema<ISubCategory>({
  name: {
    type: String,
    trim: true,
    required: [true, 'Name is required'],
    unique: true,
    minlength: [2, 'Name must be at least 3 characters long'],
    maxlength: [30, 'Name must not exceed 50 characters'],
  },
  slug:{
        type:String,
        lowercase:true,   
    },
  category: {
    type: Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
},
// other properties
}
,{timestamps:true}

);

// Mooongose query middleware
SubCategorySchema.pre(/^find/, function (next) {
  this.populate({
      path: 'category',
      select: 'name-_id',
  })
      
  next();
});
const SubCategory = model<ISubCategory>('SubCategory', SubCategorySchema);

export default SubCategory;

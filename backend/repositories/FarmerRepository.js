import Farmer from '../models/Farmer.js';

class FarmerRepository {
    async create(profileData) {
        return await Farmer.create(profileData);
    }

    async findAll() {
        return await Farmer.find().sort({ createdAt: -1 });
    }

    async findById(id) {
        return await Farmer.findById(id);
    }

    async update(id, updates) {
        return await Farmer.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );
    }

    async delete(id) {
        return await Farmer.findByIdAndDelete(id);
    }
}

export default new FarmerRepository();

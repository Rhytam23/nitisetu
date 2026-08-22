import FarmerDocument from '../models/FarmerDocument.js';
import { isDBConnected } from '../config/db.js';

class DocumentRepository {
    async create(documentData) {
        if (!isDBConnected()) return null;
        return await FarmerDocument.create(documentData);
    }

    async findByFarmerId(farmerId) {
        if (!isDBConnected()) return [];
        return await FarmerDocument.find({ farmerId }).sort({ createdAt: -1 });
    }

    async findById(id) {
        if (!isDBConnected() || !id) return null;
        try {
            return await FarmerDocument.findOne({ _id: id });
        } catch (e) {
            return null;
        }
    }

    async update(id, updateData) {
        if (!isDBConnected() || !id) return null;
        try {
            return await FarmerDocument.findOneAndUpdate(
                { _id: id },
                { $set: updateData },
                { returnDocument: 'after', runValidators: true }
            );
        } catch (e) {
            console.error('Document update error:', e.message);
            return null;
        }
    }

    async deleteById(id) {
        if (!isDBConnected() || !id) return false;
        try {
            await FarmerDocument.deleteOne({ _id: id });
            return true;
        } catch (e) {
            return false;
        }
    }
}

export default new DocumentRepository();

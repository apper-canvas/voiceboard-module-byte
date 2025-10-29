import { getApperClient } from "@/services/apperClient";

export const changelogService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "release_date_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        orderBy: [{ fieldName: "release_date_c", sorttype: "DESC" }],
        pagingInfo: { limit: 100, offset: 0 }
      };

      const response = await apperClient.fetchRecords("changelog_entry_c", params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching changelog entries:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "release_date_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      };

      const response = await apperClient.getRecordById("changelog_entry_c", id, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(`Changelog entry with id ${id} not found`);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching changelog entry ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async create(entryData) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        records: [
          {
            title_c: entryData.title_c,
            description_c: entryData.description_c,
            category_c: entryData.category_c,
            release_date_c: new Date().toISOString().split('T')[0]
          }
        ]
      };

      const response = await apperClient.createRecord("changelog_entry_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to create changelog entry: ${JSON.stringify(failed)}`);
          throw new Error(failed[0].message || "Failed to create entry");
        }
        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error creating changelog entry:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, updateData) {
    try {
      const apperClient = getApperClient();
      
      const updateFields = {
        Id: parseInt(id)
      };

      if (updateData.title_c !== undefined) updateFields.title_c = updateData.title_c;
      if (updateData.description_c !== undefined) updateFields.description_c = updateData.description_c;
      if (updateData.category_c !== undefined) updateFields.category_c = updateData.category_c;
      if (updateData.release_date_c !== undefined) updateFields.release_date_c = updateData.release_date_c;

      const params = {
        records: [updateFields]
      };

      const response = await apperClient.updateRecord("changelog_entry_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update changelog entry: ${JSON.stringify(failed)}`);
          throw new Error(failed[0].message || "Failed to update entry");
        }
        return response.results[0].data;
      }
    } catch (error) {
      console.error(`Error updating changelog entry ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord("changelog_entry_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to delete changelog entry: ${JSON.stringify(failed)}`);
          throw new Error(failed[0].message || "Failed to delete entry");
        }
        return response.results[0].data;
      }
    } catch (error) {
      console.error(`Error deleting changelog entry ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  }
};
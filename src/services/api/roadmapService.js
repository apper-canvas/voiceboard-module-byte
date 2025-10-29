import { getApperClient } from "@/services/apperClient";
import { feedbackService } from "@/services/api/feedbackService";

export const roadmapService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "feedback_post_id_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "position_c"}},
          {"field": {"Name": "estimated_date_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        orderBy: [{ fieldName: "position_c", sorttype: "ASC" }],
        pagingInfo: { limit: 200, offset: 0 }
      };

      const response = await apperClient.fetchRecords("roadmap_item_c", params);

      if (!response.success) {
        console.error(response.message);
        return { planned: [], "in-progress": [], completed: [] };
      }

      const itemsWithPosts = await Promise.all(
        response.data.map(async (item) => {
          try {
            const post = await feedbackService.getById(item.feedback_post_id_c);
            return {
              ...item,
              post
            };
          } catch (error) {
            console.error(`Failed to load post for roadmap item ${item.Id}:`, error);
            return null;
          }
        })
      );

      const validItems = itemsWithPosts.filter(Boolean);

      const grouped = {
        planned: validItems
          .filter(item => item.stage_c === "planned")
          .sort((a, b) => a.position_c - b.position_c),
        "in-progress": validItems
          .filter(item => item.stage_c === "in-progress")
          .sort((a, b) => a.position_c - b.position_c),
        completed: validItems
          .filter(item => item.stage_c === "completed")
          .sort((a, b) => b.position_c - a.position_c)
      };

      return grouped;
    } catch (error) {
      console.error("Error fetching roadmap items:", error?.response?.data?.message || error);
      return { planned: [], "in-progress": [], completed: [] };
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "feedback_post_id_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "position_c"}},
          {"field": {"Name": "estimated_date_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      };

      const response = await apperClient.getRecordById("roadmap_item_c", id, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(`Roadmap item with id ${id} not found`);
      }

      const item = response.data;

      try {
        const post = await feedbackService.getById(item.feedback_post_id_c);
        return { ...item, post };
      } catch (error) {
        throw new Error(`Associated feedback post (ID: ${item.feedback_post_id_c}) not found for roadmap item`);
      }
    } catch (error) {
      console.error(`Error fetching roadmap item ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async updateStage(feedbackPostId, newStage, newPosition = 1) {
    try {
      const apperClient = getApperClient();

      const checkParams = {
        fields: [{"field": {"Name": "Id"}}, {"field": {"Name": "feedback_post_id_c"}}],
        where: [
          {
            FieldName: "feedback_post_id_c",
            Operator: "EqualTo",
            Values: [String(feedbackPostId)]
          }
        ],
        pagingInfo: { limit: 1, offset: 0 }
      };

      const checkResponse = await apperClient.fetchRecords("roadmap_item_c", checkParams);

      if (checkResponse.success && checkResponse.data.length > 0) {
        const existingItem = checkResponse.data[0];
        
        const updateParams = {
          records: [
            {
              Id: existingItem.Id,
              stage_c: newStage,
              position_c: newPosition,
              estimated_date_c: this.getEstimatedDate(newStage)
            }
          ]
        };

        const updateResponse = await apperClient.updateRecord("roadmap_item_c", updateParams);

        if (!updateResponse.success) {
          console.error(updateResponse.message);
          throw new Error(updateResponse.message);
        }

        if (updateResponse.results) {
          const failed = updateResponse.results.filter(r => !r.success);
          if (failed.length > 0) {
            console.error(`Failed to update roadmap item: ${JSON.stringify(failed)}`);
            throw new Error(failed[0].message || "Failed to update item");
          }
          return updateResponse.results[0].data;
        }
      } else {
        const createParams = {
          records: [
            {
              feedback_post_id_c: String(feedbackPostId),
              stage_c: newStage,
              position_c: newPosition,
              estimated_date_c: this.getEstimatedDate(newStage)
            }
          ]
        };

        const createResponse = await apperClient.createRecord("roadmap_item_c", createParams);

        if (!createResponse.success) {
          console.error(createResponse.message);
          throw new Error(createResponse.message);
        }

        if (createResponse.results) {
          const failed = createResponse.results.filter(r => !r.success);
          if (failed.length > 0) {
            console.error(`Failed to create roadmap item: ${JSON.stringify(failed)}`);
            throw new Error(failed[0].message || "Failed to create item");
          }
          return createResponse.results[0].data;
        }
      }
    } catch (error) {
      console.error("Error updating roadmap stage:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async updatePosition(id, newPosition) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        records: [
          {
            Id: parseInt(id),
            position_c: newPosition
          }
        ]
      };

      const response = await apperClient.updateRecord("roadmap_item_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update roadmap position: ${JSON.stringify(failed)}`);
          throw new Error(failed[0].message || "Failed to update position");
        }
        return response.results[0].data;
      }
    } catch (error) {
      console.error(`Error updating roadmap position ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  getEstimatedDate(stage) {
    const now = new Date();
    switch (stage) {
      case "planned":
        return new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
      case "in-progress":
        return new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
      case "completed":
        return new Date().toISOString().split('T')[0];
      default:
        return null;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord("roadmap_item_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to delete roadmap item: ${JSON.stringify(failed)}`);
          throw new Error(failed[0].message || "Failed to delete item");
        }
        return response.results[0].data;
      }
    } catch (error) {
      console.error(`Error deleting roadmap item ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  }
};
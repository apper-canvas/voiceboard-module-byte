import { getApperClient } from "@/services/apperClient";

export const feedbackService = {
  async getAll(filters = {}) {
    try {
      const apperClient = getApperClient();
      
      const whereConditions = [];
      const whereGroups = [];

      if (filters.categories && filters.categories.length > 0) {
        whereConditions.push({
          FieldName: "category_c",
          Operator: "ExactMatch",
          Values: filters.categories,
          Include: true
        });
      }

      if (filters.statuses && filters.statuses.length > 0) {
        whereConditions.push({
          FieldName: "status_c",
          Operator: "ExactMatch",
          Values: filters.statuses,
          Include: true
        });
      }

      if (filters.search) {
        whereGroups.push({
          operator: "OR",
          subGroups: [
            {
              conditions: [
                {
                  fieldName: "title_c",
                  operator: "Contains",
                  values: [filters.search]
                },
                {
                  fieldName: "description_c",
                  operator: "Contains",
                  values: [filters.search]
                }
              ],
              operator: "OR"
            }
          ]
        });
      }

      let orderBy = [];
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case "votes":
            orderBy = [{ fieldName: "vote_count_c", sorttype: "DESC" }];
            break;
          case "newest":
            orderBy = [{ fieldName: "CreatedOn", sorttype: "DESC" }];
            break;
          case "oldest":
            orderBy = [{ fieldName: "CreatedOn", sorttype: "ASC" }];
            break;
          default:
            orderBy = [{ fieldName: "vote_count_c", sorttype: "DESC" }];
        }
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "vote_count_c"}},
          {"field": {"Name": "comment_count_c"}},
          {"field": {"Name": "author_name_c"}},
          {"field": {"Name": "is_anonymous_c"}},
          {"field": {"Name": "images_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        where: whereConditions,
        whereGroups: whereGroups.length > 0 ? whereGroups : undefined,
        orderBy: orderBy,
        pagingInfo: { limit: 100, offset: 0 }
      };

      const response = await apperClient.fetchRecords("feedback_post_c", params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(post => ({
        ...post,
        images_c: post.images_c ? JSON.parse(post.images_c) : []
      }));
    } catch (error) {
      console.error("Error fetching feedback posts:", error?.response?.data?.message || error);
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
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "vote_count_c"}},
          {"field": {"Name": "comment_count_c"}},
          {"field": {"Name": "author_name_c"}},
          {"field": {"Name": "is_anonymous_c"}},
          {"field": {"Name": "images_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      };

      const response = await apperClient.getRecordById("feedback_post_c", id, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(`Post with id ${id} not found`);
      }

      return {
        ...response.data,
        images_c: response.data.images_c ? JSON.parse(response.data.images_c) : []
      };
    } catch (error) {
      console.error(`Error fetching post ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async create(postData) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        records: [
          {
            title_c: postData.title_c,
            description_c: postData.description_c,
            category_c: postData.category_c,
            author_name_c: postData.author_name_c,
            is_anonymous_c: postData.is_anonymous_c,
            images_c: postData.images_c ? JSON.stringify(postData.images_c) : "[]",
            vote_count_c: 0,
            comment_count_c: 0,
            status_c: "under-review"
          }
        ]
      };

      const response = await apperClient.createRecord("feedback_post_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to create feedback post: ${JSON.stringify(failed)}`);
          throw new Error(failed[0].message || "Failed to create post");
        }
        return {
          ...response.results[0].data,
          images_c: response.results[0].data.images_c ? JSON.parse(response.results[0].data.images_c) : []
        };
      }
    } catch (error) {
      console.error("Error creating feedback post:", error?.response?.data?.message || error);
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
      if (updateData.status_c !== undefined) updateFields.status_c = updateData.status_c;
      if (updateData.vote_count_c !== undefined) updateFields.vote_count_c = updateData.vote_count_c;
      if (updateData.comment_count_c !== undefined) updateFields.comment_count_c = updateData.comment_count_c;
      if (updateData.images_c !== undefined) {
        updateFields.images_c = JSON.stringify(updateData.images_c);
      }

      const params = {
        records: [updateFields]
      };

      const response = await apperClient.updateRecord("feedback_post_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update feedback post: ${JSON.stringify(failed)}`);
          throw new Error(failed[0].message || "Failed to update post");
        }
        return {
          ...response.results[0].data,
          images_c: response.results[0].data.images_c ? JSON.parse(response.results[0].data.images_c) : []
        };
      }
    } catch (error) {
      console.error(`Error updating post ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord("feedback_post_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to delete feedback post: ${JSON.stringify(failed)}`);
          throw new Error(failed[0].message || "Failed to delete post");
        }
        return response.results[0].data;
      }
    } catch (error) {
      console.error(`Error deleting post ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  }
};
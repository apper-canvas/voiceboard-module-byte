import { getApperClient } from "@/services/apperClient";

export const commentService = {
  async getByPostId(postId) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "post_id_c"}},
          {"field": {"Name": "parent_id_c"}},
          {"field": {"Name": "author_name_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "is_anonymous_c"}},
          {"field": {"Name": "images_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        where: [
          {
            FieldName: "post_id_c",
            Operator: "EqualTo",
            Values: [String(postId)]
          }
        ],
        orderBy: [{ fieldName: "CreatedOn", sorttype: "ASC" }],
        pagingInfo: { limit: 200, offset: 0 }
      };

      const response = await apperClient.fetchRecords("comment_c", params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      const allComments = response.data.map(c => ({
        ...c,
        images_c: c.images_c ? JSON.parse(c.images_c) : []
      }));

      const topLevel = allComments.filter(c => !c.parent_id_c);
      
      const withReplies = topLevel.map(comment => {
        const replies = allComments
          .filter(c => c.parent_id_c === String(comment.Id))
          .sort((a, b) => new Date(a.CreatedOn) - new Date(b.CreatedOn));
        
        return {
          ...comment,
          replies
        };
      });
      
      return withReplies;
    } catch (error) {
      console.error("Error fetching comments:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getByRoadmapItemId(roadmapItemId) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "post_id_c"}},
          {"field": {"Name": "parent_id_c"}},
          {"field": {"Name": "author_name_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "is_anonymous_c"}},
          {"field": {"Name": "images_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        where: [
          {
            FieldName: "post_id_c",
            Operator: "EqualTo",
            Values: [String(roadmapItemId)]
          }
        ],
        orderBy: [{ fieldName: "CreatedOn", sorttype: "ASC" }],
        pagingInfo: { limit: 200, offset: 0 }
      };

      const response = await apperClient.fetchRecords("comment_c", params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      const allComments = response.data.map(c => ({
        ...c,
        images_c: c.images_c ? JSON.parse(c.images_c) : []
      }));

      const topLevel = allComments.filter(c => !c.parent_id_c);
      
      const withReplies = topLevel.map(comment => {
        const replies = allComments
          .filter(c => c.parent_id_c === String(comment.Id))
          .sort((a, b) => new Date(a.CreatedOn) - new Date(b.CreatedOn));
        
        return {
          ...comment,
          replies
        };
      });
      
      return withReplies;
    } catch (error) {
      console.error("Error fetching roadmap comments:", error?.response?.data?.message || error);
      return [];
    }
  },

  async create(commentData) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        records: [
          {
            post_id_c: String(commentData.post_id_c || commentData.postId),
            parent_id_c: commentData.parent_id_c ? String(commentData.parent_id_c) : null,
            author_name_c: commentData.author_name_c || commentData.authorName || "Anonymous",
            content_c: commentData.content_c || commentData.content,
            is_anonymous_c: commentData.is_anonymous_c || commentData.isAnonymous || false,
            images_c: commentData.images_c ? JSON.stringify(commentData.images_c) : (commentData.images ? JSON.stringify(commentData.images) : "[]")
          }
        ]
      };

      const response = await apperClient.createRecord("comment_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to create comment: ${JSON.stringify(failed)}`);
          throw new Error(failed[0].message || "Failed to create comment");
        }
        return {
          ...response.results[0].data,
          images_c: response.results[0].data.images_c ? JSON.parse(response.results[0].data.images_c) : []
        };
      }
    } catch (error) {
      console.error("Error creating comment:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async getAll() {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "post_id_c"}},
          {"field": {"Name": "parent_id_c"}},
          {"field": {"Name": "author_name_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "is_anonymous_c"}},
          {"field": {"Name": "images_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        orderBy: [{ fieldName: "CreatedOn", sorttype: "DESC" }],
        pagingInfo: { limit: 500, offset: 0 }
      };

      const response = await apperClient.fetchRecords("comment_c", params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(c => ({
        ...c,
        images_c: c.images_c ? JSON.parse(c.images_c) : []
      }));
    } catch (error) {
      console.error("Error fetching all comments:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "post_id_c"}},
          {"field": {"Name": "parent_id_c"}},
          {"field": {"Name": "author_name_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "is_anonymous_c"}},
          {"field": {"Name": "images_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      };

      const response = await apperClient.getRecordById("comment_c", id, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(`Comment with id ${id} not found`);
      }

      return {
        ...response.data,
        images_c: response.data.images_c ? JSON.parse(response.data.images_c) : []
      };
    } catch (error) {
      console.error(`Error fetching comment ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, updateData) {
    try {
      const apperClient = getApperClient();
      
      const updateFields = {
        Id: parseInt(id)
      };

      if (updateData.content_c !== undefined) updateFields.content_c = updateData.content_c;
      if (updateData.images_c !== undefined) {
        updateFields.images_c = JSON.stringify(updateData.images_c);
      }

      const params = {
        records: [updateFields]
      };

      const response = await apperClient.updateRecord("comment_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update comment: ${JSON.stringify(failed)}`);
          throw new Error(failed[0].message || "Failed to update comment");
        }
        return {
          ...response.results[0].data,
          images_c: response.results[0].data.images_c ? JSON.parse(response.results[0].data.images_c) : []
        };
      }
    } catch (error) {
      console.error(`Error updating comment ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord("comment_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to delete comment: ${JSON.stringify(failed)}`);
          throw new Error(failed[0].message || "Failed to delete comment");
        }
        return response.results[0].data;
      }
    } catch (error) {
      console.error(`Error deleting comment ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  }
};
import React, { useState, useEffect } from 'react';
import apiClient from '../utils/axios';
import { getConfig } from '../utils/config';

const CommentSection = ({ articleAlias }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 获取评论列表
  useEffect(() => {
    fetchComments();
  }, [articleAlias]);

  const getFullImageUrl = (url) => {
    if (!url) return null;

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    try {
      const config = getConfig();
      return config.getFullUrl(url);
    } catch (error) {
      if (url.startsWith('/')) {
        return url;
      }

      return `/upload/${url}`;
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/comments/article/${articleAlias}`);
      setComments(response || []);
    } catch (err) {
      setError('获取评论失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 处理主评论输入框的键盘事件
  const handleNewCommentKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newComment.trim()) {
        handleAddComment(e);
      }
    }
  };

  // 处理回复评论输入框的键盘事件
  const handleReplyCommentKeyDown = (e, commentId) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (replyContent.trim()) {
        handleReplyComment(commentId);
      }
    }
  };

  // 发表新评论
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      const requestData = {
        article_alias: articleAlias,
        content: newComment
      };

      await apiClient.post('/comments', requestData);
      setNewComment('');
      fetchComments(); // 重新获取评论列表
      setError('');
    } catch (err) {
      setError('发表评论失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 回复评论
  const handleReplyComment = async (commentId) => {
    if (!replyContent.trim()) return;

    try {
      setLoading(true);
      const requestData = {
        article_alias: articleAlias,
        content: replyContent,
        to_comment_id: commentId
      };

      await apiClient.post('/comments', requestData);
      setReplyContent('');
      setReplyingTo(null);
      fetchComments(); // 重新获取评论列表
      setError('');
    } catch (err) {
      setError('回复评论失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 点赞评论
  const handleLikeComment = async (commentId) => {
    try {
      await apiClient.post(`/comments/${commentId}/like`);
      fetchComments(); // 重新获取评论列表以更新点赞数
    } catch (err) {
      setError('点赞失败');
      console.error(err);
    }
  };

  // 删除评论
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('确定要删除这条评论吗？')) {
      return;
    }

    try {
      await apiClient.delete(`/comments/${commentId}`);
      fetchComments(); // 重新获取评论列表
      setError('');
    } catch (err) {
      setError('删除评论失败');
      console.error(err);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return '刚刚';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}分钟前`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}小时前`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)}天前`;
    }
  };

  const renderReplyComment = (comment, isNested = false, parentComment = null) => {
    return (
      <div key={comment.comment_id} className={`${isNested ? 'ml-8 mt-3' : ''}`}>
        <div className="flex">
          {/* 用户头像 */}
          <div className="flex-shrink-0 mr-3">
            {comment.avatar ? (
              <img
                src={getFullImageUrl(comment.avatar)}
                alt={comment.username}
                className="h-8 w-8 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
            ) : (
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
            )}
          </div>

          {/* 评论内容 */}
          <div className="flex-1">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center">
                <span className="font-medium text-gray-900 dark:text-white text-sm">
                  {comment.username || '匿名用户'}
                </span>
                {parentComment && (
                  <span className="text-xs text-gray-500 ml-2">
                    回复 <span className="text-blue-500">@{parentComment.username}</span>
                  </span>
                )}
                <span className="mx-2 text-gray-500">•</span>
                <span className="text-xs text-gray-500">
                  {formatTime(comment.create_time)}
                </span>
              </div>

              <p className="mt-1 text-gray-700 dark:text-gray-300 text-sm">
                {comment.content}
              </p>
            </div>

            <div className="mt-2 flex items-center space-x-4">
              <button
                onClick={() => handleLikeComment(comment.comment_id)}
                className="flex items-center text-xs text-gray-500 hover:text-blue-500"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                </svg>
                {comment.comment_like_count || 0}
              </button>

              <button
                onClick={() => {
                  setReplyingTo(comment.comment_id);
                  setReplyContent('');
                }}
                className="text-xs text-gray-500 hover:text-blue-500"
              >
                回复
              </button>

              {/* 删除按钮 */}
              <button
                onClick={() => handleDeleteComment(comment.comment_id)}
                className="text-xs text-gray-500 hover:text-red-500"
              >
                删除
              </button>
            </div>

            {/* 回复输入框 */}
            {replyingTo === comment.comment_id && (
              <div className="mt-3">
                <div className="relative">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    onKeyDown={(e) => handleReplyCommentKeyDown(e, comment.comment_id)}
                    placeholder={`回复 ${comment.username}...`}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none pr-20"
                    rows="3"
                  />
                  <div className="absolute bottom-2 right-2 flex space-x-1">
                    <button
                      onClick={() => handleReplyComment(comment.comment_id)}
                      disabled={loading || !replyContent.trim()}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                    >
                      发送
                    </button>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                    >
                      取消
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1 text-right">
                  Enter发送，Shift+Enter换行
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 渲染子评论 */}
        {comment.children && comment.children.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.children.map(child => renderReplyComment(child, true, comment))}
          </div>
        )}
      </div>
    );
  };

  // 渲染顶级评论
  const renderTopLevelComment = (comment) => {
    return (
      <div key={comment.comment_id} className="border-b border-gray-200 dark:border-gray-700 py-4">
        <div className="flex">
          {/* 用户头像 */}
          <div className="flex-shrink-0 mr-3">
            {comment.avatar ? (
              <img
                src={getFullImageUrl(comment.avatar)}
                alt={comment.username}
                className="h-10 w-10 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
            ) : (
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center">
              <span className="font-medium text-gray-900 dark:text-white">
                {comment.username || '匿名用户'}
              </span>
              <span className="mx-2 text-gray-500">•</span>
              <span className="text-sm text-gray-500">
                {formatTime(comment.create_time)}
              </span>
            </div>

            <p className="mt-1 text-gray-700 dark:text-gray-300">
              {comment.content}
            </p>
            <div className="mt-2 flex items-center space-x-4">
              <button
                onClick={() => handleLikeComment(comment.comment_id)}
                className="flex items-center text-sm text-gray-500 hover:text-blue-500"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                </svg>
                {comment.comment_like_count || 0}
              </button>

              <button
                onClick={() => {
                  setReplyingTo(comment.comment_id);
                  setReplyContent('');
                }}
                className="text-sm text-gray-500 hover:text-blue-500"
              >
                回复
              </button>

              {/* 删除按钮 */}
              <button
                onClick={() => handleDeleteComment(comment.comment_id)}
                className="text-sm text-gray-500 hover:text-red-500"
              >
                删除
              </button>
            </div>

            {/* 回复输入框 */}
            {replyingTo === comment.comment_id && (
              <div className="mt-3">
                <div className="relative">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    onKeyDown={(e) => handleReplyCommentKeyDown(e, comment.comment_id)}
                    placeholder={`回复 ${comment.username}...`}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none pr-20"
                    rows="3"
                  />
                  <div className="absolute bottom-2 right-2 flex space-x-1">
                    <button
                      onClick={() => handleReplyComment(comment.comment_id)}
                      disabled={loading || !replyContent.trim()}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                    >
                      发送
                    </button>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                    >
                      取消
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1 text-right">
                  Enter发送，Shift+Enter换行
                </div>
              </div>
            )}

            {comment.children && comment.children.length > 0 && (
              <div className="mt-4 space-y-4">
                {comment.children.map(child => renderReplyComment(child, false, comment))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-10 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">评论</h2>

      <form onSubmit={handleAddComment} className="mb-8">
        <div className="relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleNewCommentKeyDown}
            placeholder="写下你的评论..."
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none pr-24"
            rows="4"
          />
          <div className="absolute bottom-3 right-3 flex space-x-2">
            <button
              type="button"
              onClick={() => setNewComment('')}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
            >
              清空
            </button>
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="bg-blue-500 text-white px-4 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
            >
              发表
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1 text-right">
          Enter发送，Shift+Enter换行
        </div>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div>
        {loading && comments.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            还没有评论，快来抢沙发吧！
          </div>
        ) : (
          <div>
            {comments.map(renderTopLevelComment)}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;

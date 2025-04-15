import axios from 'axios';

export const fetchUsers = async () => {
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/users');
    return response.data.map(user => ({
      id: user.id.toString(), // تحويل id إلى string للتوافق مع Pinia
      name: user.name,
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return []; // إرجاع مصفوفة فارغة في حالة الخطأ
  }
};
// 'use client';
// import { useState, useEffect, useRef } from 'react';
// import Image from 'next/image';
// import { getLinkPreview } from 'link-preview-js';

// // CSS 애니메이션을 위한 스타일을 추가
// const loadingDotsAnimation = {
//   display: 'inline-block',
//   animation: 'loadingDots 1.4s infinite both',
// };

// export default function ChatButton() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [inputValue, setInputValue] = useState('');
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [subCategories, setSubCategories] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const messagesEndRef = useRef(null);

//   const categories = ['신생아', '12~24개월', '24~36개월', '36개월 이상'];

//   useEffect(() => {
//     const accessToken = localStorage.getItem('access_token');
//     setIsLoggedIn(!!accessToken);
//   }, []);

//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [messages]);

//   const toggleChat = () => {
//     const accessToken = localStorage.getItem('access_token');
//     setIsLoggedIn(!!accessToken);
//     setIsOpen(!isOpen);

//     if (!isOpen) {
//       if (!accessToken) {
//         setMessages([
//           {
//             text: '안녕하세요! HAMA 챗봇입니다 😊',
//             sender: 'bot',
//           },
//           {
//             text: '로그인하시면 아이 연령대별 맞춤 정보를 제공해드립니다.',
//             sender: 'bot',
//           },
//         ]);
//       } else if (messages.length === 0) {
//         setMessages([
//           {
//             text: '안녕하세요! HAMA 챗봇입니다 😊',
//             sender: 'bot',
//           },
//           {
//             text: '아이 연령대를 선택하시면 맞춤 정보를 제공해드립니다.',
//             sender: 'bot',
//           },
//           {
//             text: '아이 연령대를 선택해주세요',
//             sender: 'bot',
//             showCategories: true,
//           },
//         ]);
//       }
//     }
//   };

//   const handleCategorySelect = (category) => {
//     setSelectedCategory(category);
//     setMessages((prevMessages) => [
//       ...prevMessages,
//       { text: `${category} 카테고리를 선택했습니다.`, sender: 'user' },
//       {
//         text: '어떤 정보를 찾으시나요?',
//         sender: 'bot',
//         showSubCategories: true,
//       },
//     ]);

//     setSubCategories([
//       '장난감',
//       '키즈카페',
//       '육아 꿀팁',
//       '여행지 추천',
//       '만화 추천',
//       '아기 동요',
//       '어린이 뮤지컬',
//     ]);
//   };

//   const handleSubCategorySelect = async (subCategory) => {
//     setMessages((prevMessages) => [
//       ...prevMessages,
//       { text: `${subCategory} 서브 카테고리를 선택했습니다.`, sender: 'user' },
//     ]);

//     setIsLoading(true);
//     setMessages((prevMessages) => [
//       ...prevMessages,
//       { text: '...', sender: 'bot', loading: true },
//     ]);

//     const questionData = {
//       question: `${selectedCategory}에 맞는 ${subCategory} 추천해줘. 짧게 요약해주면서 AI 느낌 안 나게 답변해줘.`,
//     };

//     const headers = {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${localStorage.getItem('access_token')}`,
//     };

//     try {
//       const response = await fetch('/api/perplexity/ask', {
//         method: 'POST',
//         headers: headers,
//         body: JSON.stringify(questionData),
//       });

//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }

//       const data = await response.json();

//       setMessages((prevMessages) => prevMessages.filter((msg) => !msg.loading));

//       const citationsCount = data.citations ? data.citations.length : 0;
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         {
//           text: `${citationsCount}개의 정보를 제공해드리겠습니다.`,
//           sender: 'bot',
//         },
//       ]);

//       const content = data.content
//         .replace(/\*\*/g, '')
//         .replace(/-/g, '')
//         .replace(/\[.*?\]/g, '')
//         .replace(/^\d+\.\s*/gm, '');
//       const sentences = content.split(/(?<=[.!?])\s+/);

//       for (const sentence of sentences) {
//         if (sentence.trim()) {
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             { text: sentence.trim(), sender: 'bot' },
//           ]);
//         }
//       }

//       if (data.citations && data.citations.length > 0) {
//         setMessages((prevMessages) => [
//           ...prevMessages,
//           {
//             text: '관련 콘텐츠를 확인해보세요:',
//             sender: 'bot',
//             links: data.citations.map((link, index) => ({
//               url: link.url,
//               index: index + 1,
//               title: link.title,
//               image: link.image,
//             })),
//           },
//         ]);
//       }

//       setMessages((prevMessages) => [
//         ...prevMessages,
//         {
//           text: '대화를 초기화하시겠어요?',
//           sender: 'bot',
//           isReset: true,
//         },
//       ]);
//     } catch (error) {
//       console.error('Error:', error);
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         { text: '오류가 발생했습니다.', sender: 'bot' },
//       ]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleReset = () => {
//     setMessages([
//       {
//         text: '아이 연령대를 선택해주세요',
//         sender: 'bot',
//         showCategories: true,
//       },
//     ]);
//     setSelectedCategory(null);
//     setSubCategories([]);
//   };

//   const handleInputChange = (e) => {
//     setInputValue(e.target.value);
//   };

//   const handleSendMessage = async () => {
//     if (inputValue.trim() === '') return;

//     // 로딩 상태 표시
//     setIsLoading(true);
//     setMessages((prevMessages) => [
//       ...prevMessages,
//       { text: inputValue, sender: 'user' },
//       { text: '...', sender: 'bot', loading: true }, // 로딩 메시지 추가
//     ]);

//     setInputValue('');

//     // API 요청
//     const questionData = {
//       question: `${inputValue}. 링크는 포함하지 마세요. 사람처럼 자연스럽게 짧게 대답해 주세요.`,
//     };

//     const headers = {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${localStorage.getItem('access_token')}`,
//     };

//     try {
//       const response = await fetch('/api/perplexity/ask', {
//         method: 'POST',
//         headers: headers,
//         body: JSON.stringify(questionData),
//       });

//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }

//       const data = await response.json();

//       // 로딩 메시지 제거
//       setMessages((prevMessages) => prevMessages.filter((msg) => !msg.loading));

//       setMessages((prevMessages) => [
//         ...prevMessages,
//         { text: data.content, sender: 'bot' },
//       ]);

//       // 답변 후 초기화 메시지 추가
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         {
//           text: '대화를 초기화하시겠어요?',
//           sender: 'bot',
//           isReset: true,
//         },
//       ]);
//     } catch (error) {
//       console.error('Error fetching data:', error.message);
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         {
//           text: '챗봇의 응답을 가져오는 데 오류가 발생했습니다.',
//           sender: 'bot',
//         },
//       ]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter' && isLoggedIn) {
//       handleSendMessage();
//     }
//   };

//   //   if (!isLoggedIn) {
//   //     return null;
//   //   }

//   return (
//     <div className="fixed bottom-10 right-10 z-50">
//       <style jsx global>{`
//         @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');

//         .chat-container {
//           font-family: 'Noto Sans KR', sans-serif;
//           position: relative;
//           z-index: 10;
//         }

//         @keyframes loadingDots {
//           0% {
//             content: '.';
//           }
//           33% {
//             content: '..';
//           }
//           66% {
//             content: '...';
//           }
//         }

//         .loading-dots::after {
//           content: '.';
//           animation: loadingDots 1s infinite;
//         }

//         .message-text {
//           font-size: 1.1rem;
//           line-height: 1.6;
//           word-break: break-word;
//           max-width: 80%; /* 최대 너비 설정 */
//           overflow-wrap: break-word; /* 단어가 길어질 경우 줄 바꿈 */
//         }

//         .chat-bubble {
//           padding: 1rem 1.5rem;
//           border-radius: 1.2rem;
//           box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
//         }

//         .user-bubble {
//           background: linear-gradient(135deg, #ff8a65, #ff7043);
//           color: white;
//         }

//         .bot-bubble {
//           background: linear-gradient(135deg, #e3f2fd, #bbdefb);
//           color: #1a1a1a;
//         }

//         .category-button {
//           transition: all 0.3s ease;
//           font-weight: 500;
//           font-size: 1rem;
//           padding: 0.8rem 1.2rem;
//         }

//         .category-button:hover {
//           transform: translateY(-2px);
//         }

//         .link-card {
//           transition: all 0.3s ease;
//           background: white;
//           border-radius: 0.8rem;
//           padding: 0.8rem;
//           margin-top: 0.8rem;
//           box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
//         }

//         .link-card:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
//         }
//       `}</style>

//       <button
//         onClick={toggleChat}
//         className="bg-orange-500 text-white p-6 rounded-full shadow-lg transition-transform transform hover:scale-110"
//       >
//         💬
//       </button>

//       {isOpen && (
//         <div className="chat-container bg-white shadow-xl rounded-2xl p-6 mt-4 w-[500px] flex flex-col">
//           <div className="h-[500px] overflow-y-auto mb-6 px-4">
//             {messages.map((msg, index) => (
//               <div
//                 key={index}
//                 className={`flex items-start my-4 ${
//                   msg.sender === 'user' ? 'justify-end' : 'justify-start'
//                 }`}
//               >
//                 {msg.sender === 'bot' && (
//                   <Image
//                     src="/hama_logo.jpg"
//                     alt="Chatbot Profile"
//                     width={45}
//                     height={45}
//                     className="rounded-full mr-3 mt-1"
//                   />
//                 )}
//                 <div
//                   className={`chat-bubble message-text ${
//                     msg.sender === 'user' ? 'user-bubble' : 'bot-bubble'
//                   }`}
//                 >
//                   {msg.loading ? (
//                     <span className="loading-dots text-lg"></span>
//                   ) : msg.isReset ? (
//                     <div className="flex flex-col items-center">
//                       <span className="mb-3 text-center">{msg.text}</span>
//                       <button
//                         onClick={handleReset}
//                         className="bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition-all transform hover:scale-105"
//                       >
//                         네
//                       </button>
//                     </div>
//                   ) : (
//                     <div>
//                       <div>{msg.text}</div>
//                       {msg.showCategories && (
//                         <div className="flex flex-wrap justify-center gap-3 mt-4">
//                           {categories.map((category) => (
//                             <button
//                               key={category}
//                               onClick={() => handleCategorySelect(category)}
//                               className="category-button bg-gradient-to-r from-pink-200 to-yellow-200 text-gray-800 rounded-full hover:from-pink-300 hover:to-yellow-300"
//                             >
//                               {category}
//                             </button>
//                           ))}
//                         </div>
//                       )}
//                       {msg.showSubCategories && (
//                         <div className="flex flex-wrap justify-center gap-3 mt-4">
//                           {subCategories.map((subCategory) => (
//                             <button
//                               key={subCategory}
//                               onClick={() =>
//                                 handleSubCategorySelect(subCategory)
//                               }
//                               className="category-button bg-gradient-to-r from-green-200 to-blue-200 text-gray-800 rounded-full hover:from-green-300 hover:to-blue-300"
//                             >
//                               {subCategory}
//                             </button>
//                           ))}
//                         </div>
//                       )}
//                       {msg.links && (
//                         <div className="mt-4">
//                           <div className="flex flex-row gap-3 overflow-x-auto pb-2">
//                             {msg.links.map((link) => (
//                               <a
//                                 key={link.index}
//                                 href={link.url}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex-shrink-0 w-[200px]"
//                               >
//                                 <div className="w-full h-28 relative">
//                                   {link.image && !link.image.includes('404') ? (
//                                     <img
//                                       src={link.image}
//                                       alt={link.title}
//                                       className="w-full h-full object-cover rounded-t-lg"
//                                       onError={(e) => {
//                                         e.target.onerror = null;
//                                         e.target.src = '/hama_logo.jpg';
//                                         e.target.className =
//                                           'w-full h-full object-contain p-2';
//                                       }}
//                                     />
//                                   ) : (
//                                     <img
//                                       src="/hama_logo.jpg"
//                                       alt="하마 로고"
//                                       className="w-full h-full object-contain p-2"
//                                     />
//                                   )}
//                                 </div>
//                                 <div className="p-3">
//                                   <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
//                                     {link.title}
//                                   </h3>
//                                 </div>
//                               </a>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//             <div ref={messagesEndRef} />
//           </div>

//           <div className="flex gap-3 relative">
//             <input
//               type="text"
//               value={inputValue}
//               onChange={(e) => isLoggedIn && setInputValue(e.target.value)}
//               onKeyDown={handleKeyDown}
//               className={`flex-grow px-5 py-4 rounded-full border-2 
//                 ${
//                   isLoggedIn
//                     ? 'border-orange-300 focus:outline-none focus:border-orange-400'
//                     : 'border-gray-200 bg-gray-50 cursor-not-allowed'
//                 } text-base font-medium`}
//               placeholder={
//                 isLoggedIn
//                   ? '메시지를 입력하세요...'
//                   : '로그인 후 이용 가능합니다'
//               }
//               disabled={!isLoggedIn}
//             />
//             <button
//               onClick={handleSendMessage}
//               disabled={!isLoggedIn}
//               className={`px-8 py-4 rounded-full text-white text-base font-medium transition-all transform hover:scale-105
//                 ${
//                   isLoggedIn
//                     ? 'bg-orange-500 hover:bg-orange-600'
//                     : 'bg-gray-300 cursor-not-allowed'
//                 }`}
//             >
//               전송
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

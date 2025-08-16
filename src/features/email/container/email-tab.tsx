"use client";
import { useState } from "react";
import { FaEdit, FaPaperPlane, FaAddressBook, FaSave } from "react-icons/fa";

const contacts = [
  "Dr. Wong Kar Wai",
  "Dr. Jane Doe",
  "Dr. John Smith",
  "Dr. Alice Tan",
];

export default function EmailTab() {
  const [selectedContact, setSelectedContact] = useState<string>("");
  const [subject, setSubject] = useState<string>("Sample Subject");
  const [body, setBody] = useState<string>("Sample body text...");
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredContacts = contacts.filter((contact) =>
    contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleEditing = () => setIsEditing(!isEditing);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-xl mx-auto w-full">
      {/* Contact Select */}
      <div className="relative">
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 bg-gray-200 rounded-lg">
          <FaAddressBook className="text-gray-500" />
        </div>
        <input
          type="text"
          placeholder="Search contact..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 pl-14 bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        {searchTerm && (
          <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-auto shadow-md">
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact, index) => (
                <li
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedContact(contact);
                    setSearchTerm("");
                  }}
                >
                  {contact}
                </li>
              ))
            ) : (
              <li className="p-2 text-gray-400">No results</li>
            )}
          </ul>
        )}
      </div>

      {/* Email Card */}
      <div
        className={`relative p-6 rounded-lg shadow-md ${
          isEditing ? "bg-gray-300" : "bg-gray-200"
        }`}
      >
        {isEditing ? (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="border border-gray-400 rounded-lg p-3 bg-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Subject"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="border border-gray-400 rounded-lg p-3 bg-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none h-36"
              placeholder="Email body"
            />
          </div>
        ) : (
          <div className="whitespace-pre-wrap">
            <strong>{subject}</strong>
            <p className="mt-2 text-gray-700">{body}</p>
          </div>
        )}
        <button
          onClick={toggleEditing}
          className="absolute bottom-3 right-3 text-gray-600 hover:text-gray-800"
        >
          {isEditing ? <FaSave /> : <FaEdit />}
        </button>
      </div>

      {/* AI Prompt */}
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Prompt your changes..."
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          className="w-full border border-gray-300 rounded-full p-3 pl-4 pr-14 bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-200 rounded-full p-3 flex items-center justify-center">
          <FaPaperPlane className="text-purple-600" />
        </div>
      </div>
    </div>
  );
}

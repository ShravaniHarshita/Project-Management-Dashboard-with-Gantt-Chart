import React, { useState } from 'react';
import {
  HiOutlineSupport,
  HiOutlineQuestionMarkCircle,
  HiOutlineBookOpen,
  HiOutlineMail,
  HiOutlineChat,
  HiOutlinePhone,
  HiOutlineExternalLink,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineSearch,
  HiOutlineDocumentText,
  HiOutlineLightBulb,
  HiOutlineVideoCamera,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import './HelpSupport.css';

const HelpSupport = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: 'How do I create a new project?',
      answer: 'To create a new project, navigate to the Projects page and click the "New Project" button in the top right corner. Fill in the project details including name, description, start date, end date, and team members. Click "Create" to save your new project.',
    },
    {
      id: 2,
      question: 'How do I assign tasks to team members?',
      answer: 'You can assign tasks by opening a project and navigating to the Tasks tab. Click on any task to open its details, then use the "Assignee" dropdown to select a team member. You can also assign tasks when creating new ones.',
    },
    {
      id: 3,
      question: 'How do I view the Gantt chart?',
      answer: 'The Gantt chart can be accessed from the sidebar by clicking on "Gantt Chart". You can view all projects or select a specific project from the dropdown. The chart shows task timelines, dependencies, and progress.',
    },
    {
      id: 4,
      question: 'How do I change my notification settings?',
      answer: 'Go to Settings from the profile menu in the top right corner. Under the "Notifications" section, you can toggle various notification types including email notifications, push notifications, task reminders, and weekly digests.',
    },
    {
      id: 5,
      question: 'How do I add team members to a project?',
      answer: 'Open the project you want to modify and go to the "Team" or "Resources" section. Click "Add Member" and select from available team members. You can also set their role and permissions for the project.',
    },
    {
      id: 6,
      question: 'Can I export project data?',
      answer: 'Yes! You can export project data by going to the Project Details page and clicking the export button. Data can be exported in various formats including CSV, Excel, and PDF for reports.',
    },
    {
      id: 7,
      question: 'How do I track time on tasks?',
      answer: 'Each task has a time tracking feature. Open a task and click "Start Timer" to begin tracking. You can also manually log time by clicking "Log Time" and entering the hours worked.',
    },
    {
      id: 8,
      question: 'How do I switch between dark and light mode?',
      answer: 'The application uses a clean light theme design optimized for readability and productivity. The interface is designed to be professional and easy on the eyes during long work sessions.',
    },
  ];

  const quickLinks = [
    {
      icon: <HiOutlineBookOpen />,
      title: 'Documentation',
      description: 'Complete guide to all features',
      action: () => toast('Opening documentation...', { icon: '📖' }),
    },
    {
      icon: <HiOutlineVideoCamera />,
      title: 'Video Tutorials',
      description: 'Watch step-by-step guides',
      action: () => toast('Opening video tutorials...', { icon: '🎬' }),
    },
    {
      icon: <HiOutlineLightBulb />,
      title: 'Tips & Tricks',
      description: 'Get the most out of the app',
      action: () => toast('Loading tips...', { icon: '💡' }),
    },
    {
      icon: <HiOutlineDocumentText />,
      title: 'Release Notes',
      description: 'See what\'s new',
      action: () => toast('Opening release notes...', { icon: '📋' }),
    },
  ];

  const contactOptions = [
    {
      icon: <HiOutlineMail />,
      title: 'Email Support',
      description: 'support@projectdash.com',
      subtext: 'Response within 24 hours',
      action: () => {
        window.location.href = 'mailto:support@projectdash.com';
        toast.success('Opening email client...');
      },
    },
    {
      icon: <HiOutlineChat />,
      title: 'Live Chat',
      description: 'Chat with our support team',
      subtext: 'Available 9 AM - 6 PM PST',
      action: () => toast('Live chat coming soon!', { icon: '💬' }),
    },
    {
      icon: <HiOutlinePhone />,
      title: 'Phone Support',
      description: '+1 (555) 123-4567',
      subtext: 'Mon-Fri, 9 AM - 5 PM PST',
      action: () => toast('Phone support: +1 (555) 123-4567', { icon: '📞' }),
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="help-page">
      {/* Header */}
      <div className="page-header">
        <h1><HiOutlineSupport /> Help & Support</h1>
        <p>Find answers, get help, and learn how to use the app</p>
      </div>

      {/* Search */}
      <div className="help-search">
        <HiOutlineSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search for help..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Quick Links */}
      <div className="help-section">
        <h2>Quick Links</h2>
        <div className="quick-links-grid">
          {quickLinks.map((link, index) => (
            <button key={index} className="quick-link-card" onClick={link.action}>
              <div className="quick-link-icon">{link.icon}</div>
              <div className="quick-link-content">
                <h3>{link.title}</h3>
                <p>{link.description}</p>
              </div>
              <HiOutlineExternalLink className="external-icon" />
            </button>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="help-section">
        <h2><HiOutlineQuestionMarkCircle /> Frequently Asked Questions</h2>
        <div className="faq-list">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className={`faq-item ${expandedFaq === faq.id ? 'expanded' : ''}`}
              >
                <button className="faq-question" onClick={() => toggleFaq(faq.id)}>
                  <span>{faq.question}</span>
                  {expandedFaq === faq.id ? (
                    <HiOutlineChevronUp />
                  ) : (
                    <HiOutlineChevronDown />
                  )}
                </button>
                {expandedFaq === faq.id && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-results">
              <HiOutlineQuestionMarkCircle />
              <p>No matching questions found. Try a different search term or contact support.</p>
            </div>
          )}
        </div>
      </div>

      {/* Contact Support */}
      <div className="help-section">
        <h2>Contact Support</h2>
        <div className="contact-grid">
          {contactOptions.map((option, index) => (
            <button key={index} className="contact-card" onClick={option.action}>
              <div className="contact-icon">{option.icon}</div>
              <div className="contact-content">
                <h3>{option.title}</h3>
                <p className="contact-description">{option.description}</p>
                <span className="contact-subtext">{option.subtext}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="help-footer">
        <p>Can't find what you're looking for?</p>
        <button 
          className="btn btn-primary"
          onClick={() => toast('Opening support ticket form...', { icon: '🎫' })}
        >
          Submit a Support Ticket
        </button>
      </div>
    </div>
  );
};

export default HelpSupport;

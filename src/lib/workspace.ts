import { auth } from './firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';

export const WORKSPACE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/chat.spaces',
  'https://www.googleapis.com/auth/chat.spaces.readonly',
  'https://www.googleapis.com/auth/chat.spaces.create',
  'https://www.googleapis.com/auth/chat.messages',
  'https://www.googleapis.com/auth/chat.messages.readonly',
  'https://www.googleapis.com/auth/chat.messages.create',
  'https://www.googleapis.com/auth/chat.memberships',
  'https://www.googleapis.com/auth/chat.memberships.readonly',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/tasks.readonly',
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.body.readonly',
  'https://www.googleapis.com/auth/forms.responses.readonly',
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/documents.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/classroom.courses',
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students',
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  'https://www.googleapis.com/auth/classroom.announcements',
  'https://www.googleapis.com/auth/classroom.announcements.readonly',
  'https://www.googleapis.com/auth/classroom.rosters',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.topics',
  'https://www.googleapis.com/auth/classroom.topics.readonly'
];

export const googleProvider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => {
  googleProvider.addScope(scope);
});

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // When restored without in-memory token, wait for interactive sign-in
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string; idToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Could not obtain Google OAuth access token');
    }

    cachedAccessToken = credential.accessToken;
    const idToken = await result.user.getIdToken();

    // Sync user with Cloud SQL backend
    try {
      await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });
    } catch (e) {
      console.warn('Sync user to Cloud SQL notice:', e);
    }

    return { user: result.user, accessToken: cachedAccessToken, idToken };
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/* =========================================================================
   GOOGLE WORKSPACE APIS
   ========================================================================= */

// 1. Google Chat API
export async function getChatSpaces(token: string) {
  const res = await fetch('https://chat.googleapis.com/v1/spaces', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Google Chat API error: ${res.statusText}`);
  return await res.json();
}

export async function getChatMessages(token: string, spaceName: string) {
  const res = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Google Chat API error: ${res.statusText}`);
  return await res.json();
}

export async function sendChatMessage(token: string, spaceName: string, text: string) {
  const res = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`Failed to send Chat message: ${res.statusText}`);
  return await res.json();
}

// 2. Google Drive API
export async function getDriveFiles(token: string, pageSize = 20) {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?pageSize=${pageSize}&fields=nextPageToken,files(id,name,mimeType,thumbnailLink,webViewLink,iconLink,size,modifiedTime)`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Google Drive API error: ${res.statusText}`);
  return await res.json();
}

export async function uploadFileToDrive(token: string, file: File, description?: string) {
  const metadata = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    description: description || 'Uploaded from 11 Star Club Portal',
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Failed to upload file to Google Drive: ${res.statusText}`);
  return await res.json();
}

export async function deleteDriveFile(token: string, fileId: string) {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to delete Google Drive file: ${res.statusText}`);
  return true;
}

// 3. Google Calendar API
export async function getCalendarEvents(token: string, calendarId = 'primary') {
  const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${timeMin}&singleEvents=true&orderBy=startTime&maxResults=50`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Google Calendar API error: ${res.statusText}`);
  return await res.json();
}

export async function createCalendarEvent(token: string, event: {
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime: string };
  end: { dateTime: string };
}) {
  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });
  if (!res.ok) throw new Error(`Failed to create Calendar event: ${res.statusText}`);
  return await res.json();
}

// 4. Google Tasks API
export async function getTaskLists(token: string) {
  const res = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Google Tasks API error: ${res.statusText}`);
  return await res.json();
}

export async function getTasks(token: string, tasklistId = '@default') {
  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${tasklistId}/tasks?showCompleted=true&showHidden=true`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Google Tasks API error: ${res.statusText}`);
  return await res.json();
}

export async function createTask(token: string, tasklistId = '@default', task: { title: string; notes?: string; due?: string }) {
  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${tasklistId}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error(`Failed to create task: ${res.statusText}`);
  return await res.json();
}

export async function toggleTaskStatus(token: string, tasklistId = '@default', taskId: string, completed: boolean) {
  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${tasklistId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: completed ? 'completed' : 'needsAction',
      completed: completed ? new Date().toISOString() : null,
    }),
  });
  if (!res.ok) throw new Error(`Failed to update task: ${res.statusText}`);
  return await res.json();
}

// 5. Google Forms API & Drive Forms
export async function getDriveForms(token: string) {
  const q = encodeURIComponent("mimeType='application/vnd.google-apps.form'");
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink,createdTime,modifiedTime)`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Google Forms fetch error: ${res.statusText}`);
  return await res.json();
}

export async function getFormDetails(token: string, formId: string) {
  const res = await fetch(`https://forms.googleapis.com/v1/forms/${formId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Google Form details error: ${res.statusText}`);
  return await res.json();
}

export async function getFormResponses(token: string, formId: string) {
  const res = await fetch(`https://forms.googleapis.com/v1/forms/${formId}/responses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Google Form responses error: ${res.statusText}`);
  return await res.json();
}

// 6. Gmail API
export async function getGmailMessages(token: string, maxResults = 20) {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Gmail API error: ${res.statusText}`);
  const list = await res.json();
  if (!list.messages || list.messages.length === 0) return { messages: [] };

  const details = await Promise.all(
    list.messages.slice(0, 10).map(async (m: any) => {
      try {
        const itemRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!itemRes.ok) return m;
        return await itemRes.json();
      } catch {
        return m;
      }
    })
  );

  return { messages: details };
}

export async function sendGmailEmail(token: string, to: string, subject: string, bodyText: string) {
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const messageParts = [
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    bodyText,
  ];
  const message = messageParts.join('\r\n');
  const encodedMessage = btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encodedMessage }),
  });
  if (!res.ok) throw new Error(`Failed to send email: ${res.statusText}`);
  return await res.json();
}

// 7. Google Docs API
export async function getDriveDocs(token: string) {
  const q = encodeURIComponent("mimeType='application/vnd.google-apps.document'");
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink,createdTime,modifiedTime,iconLink)&pageSize=25`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Google Docs fetch error: ${res.statusText}`);
  return await res.json();
}

export async function getDocDetails(token: string, documentId: string) {
  const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Google Doc details error: ${res.statusText}`);
  return await res.json();
}

export async function createGoogleDoc(token: string, title: string, initialContent?: string) {
  // Step 1: Create document
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
  if (!createRes.ok) throw new Error(`Failed to create Google Doc: ${createRes.statusText}`);
  const doc = await createRes.json();

  // Step 2: Insert initial text if provided
  if (initialContent && initialContent.trim() && doc.documentId) {
    try {
      await fetch(`https://docs.googleapis.com/v1/documents/${doc.documentId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: initialContent + '\n',
              },
            },
          ],
        }),
      });
    } catch (e) {
      console.warn('Doc initial content insert notice:', e);
    }
  }

  return doc;
}

// 8. Google Sheets API
export async function getDriveSheets(token: string) {
  const q = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet'");
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink,createdTime,modifiedTime,iconLink)&pageSize=25`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Google Sheets fetch error: ${res.statusText}`);
  return await res.json();
}

export async function getSheetDetails(token: string, spreadsheetId: string) {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Google Sheet details error: ${res.statusText}`);
  return await res.json();
}

export async function getSheetValues(token: string, spreadsheetId: string, range: string) {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Google Sheet values error: ${res.statusText}`);
  return await res.json();
}

export async function createGoogleSheet(token: string, title: string, headers?: string[]) {
  const body: any = {
    properties: {
      title,
    },
  };

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Failed to create Google Sheet: ${res.statusText}`);
  const sheet = await res.json();

  // If headers provided, write first row
  if (headers && headers.length > 0 && sheet.spreadsheetId) {
    try {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheet.spreadsheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [headers],
        }),
      });
    } catch (e) {
      console.warn('Initial sheet header write notice:', e);
    }
  }

  return sheet;
}

export async function appendSheetRow(token: string, spreadsheetId: string, range: string, rowValues: (string | number)[]) {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [rowValues],
    }),
  });
  if (!res.ok) throw new Error(`Failed to append row: ${res.statusText}`);
  return await res.json();
}

// 9. Google Classroom API
export async function getClassroomCourses(token: string) {
  const res = await fetch('https://classroom.googleapis.com/v1/courses?pageSize=20', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Google Classroom error: ${res.statusText}`);
  return await res.json();
}

export async function getClassroomCourseWork(token: string, courseId: string) {
  const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Classroom coursework error: ${res.statusText}`);
  return await res.json();
}

export async function getClassroomAnnouncements(token: string, courseId: string) {
  const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/announcements`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Classroom announcements error: ${res.statusText}`);
  return await res.json();
}

export async function createClassroomCourse(token: string, name: string, section?: string, descriptionHeading?: string) {
  const res = await fetch('https://classroom.googleapis.com/v1/courses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      section: section || 'Club Education Wing',
      descriptionHeading: descriptionHeading || '11 Star Club Educational Program',
      ownerId: 'me',
      courseState: 'ACTIVE',
    }),
  });
  if (!res.ok) throw new Error(`Failed to create Classroom course: ${res.statusText}`);
  return await res.json();
}


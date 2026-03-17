# CRM Incoming Chat Bug

## Status (Current)
- Table column-shift bug in CRM list: **fixed**.
- WA `extractWhatsAppPhoneNumber is not defined` runtime error: **fixed**.
- Incoming lead chat not always visible in CRM bubble thread: **still under observation/testing**.

## 1) Issue -> Change -> Fix

### Issue A: CRM column shifted (Chat Status/PIC/Last Contact/Actions)
**Cause:** Invalid JSX nesting in `sales-crm/frontend/src/components/ClientTable.jsx` made table cells render in wrong order.

**Change:** Repaired OTW cell closing tags so `<td className="col-chat-status">` is a sibling column, not nested inside OTW cell.

**Fix result:** Column alignment restored and Actions column renders again.

### Issue B: WA incoming handler error (`extractWhatsAppPhoneNumber is not defined`)
**Cause:** Function used in `message_create` handler but not imported in `sales-crm/backend/src/utils/whatsappService.js`.

**Change:** Added import:
```js
import { standardizePhoneNumber, extractWhatsAppPhoneNumber } from './phoneUtils.js';
```

**Fix result:** Incoming handler no longer throws that ReferenceError.

## 2) Chat Fetch Flow (API + standardize + hash)

### Write path: outgoing (CRM -> API)
1. FE `ChatModal.jsx` calls `POST /api/chat` via `chatAPI.sendMessage(clientId, message, isOutgoing, sendViaWhatsApp)`.
2. Backend `sales-crm/backend/src/routes/chat.routes.js` loads client.
3. Backend standardizes client phone using `standardizePhoneNumber(client.phoneNumber)`.
4. Backend computes `phoneHash = md5(standardizedPhone)`.
5. Message saved to `chatHistory` with `{ clientId, phoneHash, isOutgoing }`.

### Write path: incoming (WhatsApp -> API service)
1. `whatsappService.js` receives `message_create` event.
2. Extracts number with `extractWhatsAppPhoneNumber(message)`.
3. Normalizes with `standardizePhoneNumber(...)`.
4. Computes same `phoneHash` (`md5`).
5. Stores incoming row in `chatHistory` (often `clientId: null` until linked).

### Read path: open chat bubble in CRM
1. FE calls `GET /api/chat/:clientId`.
2. Backend computes canonical hash from client phone.
3. Backend returns merged rows:
   - linked rows (`clientId = :clientId` + same hash)
   - orphan rows (`clientId = null` + same hash)
4. FE renders bubbles by `isOutgoing` (`user` vs `client`).

## 3) Current unsolved bug: some incoming lead chats not shown
Probable root cause is **phone-hash mismatch** between incoming write flow and client read flow:
- lead message stored with hash from one normalized number variant,
- while client thread query uses hash from another variant (or old/changed number).

This explains why personal-number tests can pass while some lead numbers still fail.

## 4) How to debug next time quickly
For one missing-lead message, compare both sides:
- WA raw number (`message.from`/`to`)
- extracted number
- standardized number
- computed hash at incoming write time
- client phone + standardized number + hash at `GET /api/chat/:clientId`

If mismatch is found, implement canonical reconciliation (rehash/migration or multi-hash fallback).

## 5) Reuse note for future Codex runs
Tell Codex:
> Read `documentation/CRMIncomingChatBug.md` first, then debug incoming lead chat visibility by tracing hash generation in write flow vs read flow.

When permanent fix is proven, update this file with exact root cause + final patch + verification evidence.

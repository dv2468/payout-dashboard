import { type ObjectId } from 'mongodb';
import { type TWebhookTypes } from 'method-node';

type UploadStatus =
    | 'processing_file'
    | 'ready_for_payout'
    | 'processing_payout'
    | 'payout_complete';
interface Address {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
}

export interface Webhook {
    _id?: ObjectId;
    type: TWebhookTypes;
}

export interface Upload {
    _id?: ObjectId;
    fileName: string;
    status: UploadStatus;
}

export interface Payment {
    _id?: ObjectId;
    payor: {
        dunkinId: string;
        name: string;
        routing: string;
        accountNumber: string;
    };
    payee: {
        dunkinId: string;
        plaidId: string;
        loanAccount: string;
        name: string;
        dunkinBranch: string;
    };
    amount: number;
    uploadId?: ObjectId;
    paymentId?: string;
    status?: string;
}

export interface Payor {
    _id?: ObjectId;
    dunkinId: string;
    name: string;
    dBA?: string;
    eIN: string;
    aBARouting: string;
    accountNumber: string;
    address: Address;
    entityId?: string;
    accountId?: string;
}

export interface Payee {
    _id?: ObjectId;
    dunkinId: string;
    dOB?: string;
    dunkinBranch: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string;
    entityId?: string;
}

export interface PayeeLoan {
    _id?: ObjectId;
    dunkinId: string;
    plaidId: string;
    loanAccountNumber: string;
    accountId?: string;
}

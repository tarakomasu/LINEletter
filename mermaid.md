
```mermaid
graph TD
    subgraph "User Device"
        A[User on LINE] -->|Login| B{Next.js Frontend};
    end

    subgraph "Next.js App"
        B -->|Auth Request| C[NextAuth.js];
        C -->|LINE Provider| D[LINE Login API];
        D --> C;
        C --> B;

        B --> E{Editor UI (Fabric.js)};
        E -->|Generate PNG & JSON| F[Client-side Logic];
        F -->|Upload Image| G[Supabase Storage];
        F -->|Save Metadata| H[Supabase Database];
    end

    subgraph "Backend Services"
        G;
        H;
    end

    subgraph "Sharing"
        B -->|Share on LINE| I[LIFF shareTargetPicker];
        I --> J[LINE Chat];
    end

    subgraph "Viewing"
        J -->|Open Link| K[Next.js Viewer Page];
        K -->|Fetch Data| H;
        K -->|Fetch Image| G;
        H --> K;
        G --> K;
    end

    style B fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#ccf,stroke:#333,stroke-width:2px
    style G fill:#cfc,stroke:#333,stroke-width:2px
    style H fill:#cfc,stroke:#333,stroke-width:2px
    style K fill:#fcf,stroke:#333,stroke-width:2px
```

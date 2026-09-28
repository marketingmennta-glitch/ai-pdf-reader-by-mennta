import { DocumentVersion, DocumentSnapshot, VersionAuthor, VersionChangeSummary, PdfDocument, Annotation } from '../types/pdfak';
import { SAMPLE_PDFS } from '../data/samplePdfs';

const STORAGE_KEY_PREFIX = 'pdfak_versions_';

// Create clean initial checkpoint when a real document is ingested
function generateInitialSeeds(pdfId: string, doc: PdfDocument): DocumentVersion[] {
  return [
    {
      id: `ver-${pdfId}-initial`,
      pdfId,
      versionNumber: 'v1.0',
      name: 'Initial Upload Checkpoint',
      description: 'Original document imported into secure workspace.',
      type: 'auto',
      author: {
        name: 'Alex Vance',
        email: 'alex.vance@enterprise.com',
        role: 'Senior Principal Researcher',
        isCurrentUser: true,
      },
      createdAt: doc.uploadDate ? new Date(doc.uploadDate).toISOString() : new Date().toISOString(),
      isMilestone: true,
      isCurrent: true,
      changeSummary: {
        description: `Imported ${doc.pageCount} pages.`,
        annotationsAdded: 0,
        annotationsRemoved: 0,
        pagesModified: [],
        textChangesCount: 0,
      },
      snapshot: {
        name: doc.name,
        pageCount: doc.pageCount,
        pages: doc.pages,
        annotations: [],
        summary: doc.summary,
        tags: doc.tags,
      },
    },
  ];
}

class VersionHistoryService {
  private cache: Map<string, DocumentVersion[]> = new Map();

  constructor() {
    // Hydrate from localStorage where available
    if (typeof window !== 'undefined') {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
            const pdfId = key.replace(STORAGE_KEY_PREFIX, '');
            const raw = localStorage.getItem(key);
            if (raw) {
              const versions: DocumentVersion[] = JSON.parse(raw);
              this.cache.set(pdfId, versions);
            }
          }
        }
      } catch (err) {
        console.warn('Could not read version history from localStorage', err);
      }
    }
  }

  private persist(pdfId: string, versions: DocumentVersion[]) {
    this.cache.set(pdfId, versions);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${pdfId}`, JSON.stringify(versions));
      } catch (err) {
        console.warn('Could not persist version history to localStorage', err);
      }
    }
  }

  /**
   * Retrieves all versions for a given PDF, initializing with realistic seed data if not present.
   */
  public getVersions(pdfId: string, currentFallbackDoc?: PdfDocument, currentAnnotations?: Annotation[]): DocumentVersion[] {
    let versions = this.cache.get(pdfId);

    if (!versions || versions.length === 0) {
      const doc = currentFallbackDoc || SAMPLE_PDFS.find((p) => p.id === pdfId) || {
        id: pdfId,
        name: 'Document.pdf',
        size: '1.2 MB',
        pageCount: 1,
        uploadDate: '2026-07-25',
        category: 'Research',
        tags: ['PDF'],
        isFavorite: false,
        isRecent: true,
        pages: [{ pageNumber: 1, text: 'Sample document text.' }],
      } as PdfDocument;

      versions = generateInitialSeeds(pdfId, doc);

      // If current annotations were supplied, sync them into the current version snapshot
      if (currentAnnotations && currentAnnotations.length > 0) {
        const curIdx = versions.findIndex((v) => v.isCurrent);
        if (curIdx >= 0) {
          versions[curIdx].snapshot.annotations = [...currentAnnotations];
        }
      }

      this.persist(pdfId, versions);
    }

    return versions;
  }

  public getVersionById(pdfId: string, versionId: string): DocumentVersion | undefined {
    const versions = this.getVersions(pdfId);
    return versions.find((v) => v.id === versionId);
  }

  public getCurrentVersion(pdfId: string): DocumentVersion | undefined {
    const versions = this.getVersions(pdfId);
    return versions.find((v) => v.isCurrent) || versions[versions.length - 1];
  }

  /**
   * Save a new manual version created by the user.
   */
  public saveManualVersion(
    pdfId: string,
    snapshot: DocumentSnapshot,
    meta: {
      name?: string;
      description?: string;
      isMilestone?: boolean;
      author?: VersionAuthor;
      changeSummary?: Partial<VersionChangeSummary>;
    }
  ): DocumentVersion {
    const versions = [...this.getVersions(pdfId)];

    // Calculate version number (e.g. v2.1 or v3.0)
    const prevVersion = versions.find((v) => v.isCurrent) || versions[versions.length - 1];
    let nextVersionNum = 'v2.1';
    if (prevVersion) {
      const match = prevVersion.versionNumber.match(/v(\d+)\.(\d+)/);
      if (match) {
        const major = parseInt(match[1], 10);
        const minor = parseInt(match[2], 10);
        nextVersionNum = meta.isMilestone ? `v${major + 1}.0` : `v${major}.${minor + 1}`;
      }
    }

    // Unset current on all previous
    const updatedVersions = versions.map((v) => ({ ...v, isCurrent: false }));

    const defaultAuthor: VersionAuthor = meta.author || {
      name: 'Alex Vance',
      email: 'alex.vance@enterprise.com',
      role: 'Senior Principal Researcher',
      isCurrentUser: true,
    };

    const newVersion: DocumentVersion = {
      id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      pdfId,
      versionNumber: nextVersionNum,
      name: meta.name || `Manual Save (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      description: meta.description || 'Manual checkpoint committed by user.',
      type: 'manual',
      author: defaultAuthor,
      createdAt: new Date().toISOString(),
      isMilestone: !!meta.isMilestone,
      isCurrent: true,
      changeSummary: {
        description: meta.changeSummary?.description || `Manual snapshot with ${snapshot.annotations.length} annotations and ${snapshot.pageCount} pages.`,
        annotationsAdded: meta.changeSummary?.annotationsAdded ?? snapshot.annotations.length,
        annotationsRemoved: meta.changeSummary?.annotationsRemoved ?? 0,
        pagesModified: meta.changeSummary?.pagesModified ?? [1],
        textChangesCount: meta.changeSummary?.textChangesCount ?? 1,
      },
      snapshot: JSON.parse(JSON.stringify(snapshot)),
    };

    updatedVersions.push(newVersion);
    this.persist(pdfId, updatedVersions);
    return newVersion;
  }

  /**
   * Record a collaborative change (e.g. teammate edits, reviews, approval stamps).
   */
  public recordCollaborativeChange(
    pdfId: string,
    snapshot: DocumentSnapshot,
    collaborator: VersionAuthor,
    description: string,
    changeSummary?: Partial<VersionChangeSummary>
  ): DocumentVersion {
    const versions = [...this.getVersions(pdfId)];

    const prevVersion = versions.find((v) => v.isCurrent) || versions[versions.length - 1];
    let nextVersionNum = 'v2.1';
    if (prevVersion) {
      const match = prevVersion.versionNumber.match(/v(\d+)\.(\d+)/);
      if (match) {
        const major = parseInt(match[1], 10);
        const minor = parseInt(match[2], 10);
        nextVersionNum = `v${major}.${minor + 1}`;
      }
    }

    const updatedVersions = versions.map((v) => ({ ...v, isCurrent: false }));

    const newVersion: DocumentVersion = {
      id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      pdfId,
      versionNumber: nextVersionNum,
      name: `Collaborative: ${collaborator.name} review`,
      description,
      type: 'collaborative',
      author: collaborator,
      createdAt: new Date().toISOString(),
      isMilestone: false,
      isCurrent: true,
      changeSummary: {
        description,
        annotationsAdded: changeSummary?.annotationsAdded ?? 1,
        annotationsRemoved: changeSummary?.annotationsRemoved ?? 0,
        pagesModified: changeSummary?.pagesModified ?? [1],
        textChangesCount: changeSummary?.textChangesCount ?? 0,
      },
      snapshot: JSON.parse(JSON.stringify(snapshot)),
    };

    updatedVersions.push(newVersion);
    this.persist(pdfId, updatedVersions);
    return newVersion;
  }

  /**
   * Restore a historical version. This:
   * 1. Finds the target version.
   * 2. Preserves the current state as a backup checkpoint.
   * 3. Creates a new restored version entry marked as current so no history is ever destroyed.
   * 4. Returns both the restored snapshot and the new checkpoint.
   */
  public restoreVersion(
    pdfId: string,
    targetVersionId: string,
    restoredBy?: VersionAuthor
  ): { restoredVersion: DocumentVersion; newCheckpoint: DocumentVersion } | null {
    const versions = [...this.getVersions(pdfId)];
    const targetVersion = versions.find((v) => v.id === targetVersionId);
    if (!targetVersion) return null;

    const currentVersion = versions.find((v) => v.isCurrent) || versions[versions.length - 1];

    // Calculate next version number
    const match = currentVersion.versionNumber.match(/v(\d+)\.(\d+)/);
    let nextVersionNum = 'v3.0';
    if (match) {
      const major = parseInt(match[1], 10);
      const minor = parseInt(match[2], 10);
      nextVersionNum = `v${major}.${minor + 1}`;
    }

    const author: VersionAuthor = restoredBy || {
      name: 'Alex Vance',
      email: 'alex.vance@enterprise.com',
      role: 'Senior Principal Researcher',
      isCurrentUser: true,
    };

    // De-activate all
    const updatedVersions = versions.map((v) => ({ ...v, isCurrent: false }));

    const newCheckpoint: DocumentVersion = {
      id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      pdfId,
      versionNumber: nextVersionNum,
      name: `Restored to ${targetVersion.versionNumber} ("${targetVersion.name}")`,
      description: `Rollback executed by ${author.name}. Restored document state from ${new Date(targetVersion.createdAt).toLocaleDateString()}.`,
      type: 'restored',
      author,
      createdAt: new Date().toISOString(),
      isMilestone: true,
      isCurrent: true,
      changeSummary: {
        description: `Restored exact snapshot of ${targetVersion.versionNumber} (${targetVersion.snapshot.pageCount} pages, ${targetVersion.snapshot.annotations.length} annotations).`,
        annotationsAdded: targetVersion.snapshot.annotations.length,
        annotationsRemoved: currentVersion.snapshot.annotations.length,
        pagesModified: [1],
        textChangesCount: 1,
      },
      snapshot: JSON.parse(JSON.stringify(targetVersion.snapshot)),
    };

    updatedVersions.push(newCheckpoint);
    this.persist(pdfId, updatedVersions);

    return {
      restoredVersion: targetVersion,
      newCheckpoint,
    };
  }

  /**
   * Interactive helper: Simulates a teammate making a live collaborative change on the document.
   */
  public simulateCollaborativeEdit(
    pdfId: string,
    currentSnapshot: DocumentSnapshot
  ): { newVersion: DocumentVersion; updatedSnapshot: DocumentSnapshot } {
    const collaborators: { author: VersionAuthor; action: string; note: string; annotationType: 'sticky' | 'stamp' | 'highlight' }[] = [
      {
        author: {
          name: 'Sarah Lin',
          email: 'sarah.lin@enterprise.com',
          role: 'Lead Security Auditor',
          avatar: '',
          isCurrentUser: false,
        },
        action: 'Affixed Security Review Approval Stamp & Compliance Notes',
        note: 'Zero-Trust network segmentation clause approved for production deployment.',
        annotationType: 'stamp',
      },
      {
        author: {
          name: 'Dr. Aris Thorne',
          email: 'aris.thorne@stanford.edu',
          role: 'Visiting Research Fellow',
          avatar: '',
          isCurrentUser: false,
        },
        action: 'Added Mathematical Derivation Verification Note',
        note: 'Verified gradient scaling bounds on Section 4 benchmark tables.',
        annotationType: 'sticky',
      },
      {
        author: {
          name: 'Elena Rostova',
          email: 'elena.r@lexcounsel.org',
          role: 'Principal Legal Counsel',
          avatar: '',
          isCurrentUser: false,
        },
        action: 'Legal Disclaimer & Patent Clause Redline',
        note: 'Added intellectual property protections in Page 1 header.',
        annotationType: 'sticky',
      },
    ];

    const pick = collaborators[Math.floor(Math.random() * collaborators.length)];

    const updatedAnnotations: Annotation[] = [
      ...currentSnapshot.annotations,
      {
        id: `ann-collab-${Date.now()}`,
        pdfId,
        pageNumber: 1,
        type: pick.annotationType,
        color: pick.annotationType === 'stamp' ? '#22C55E' : '#A855F7',
        x: pick.annotationType === 'stamp' ? 440 : 160 + Math.floor(Math.random() * 80),
        y: pick.annotationType === 'stamp' ? 90 : 200 + Math.floor(Math.random() * 100),
        text: pick.note,
        author: pick.author.name,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];

    const updatedPages = currentSnapshot.pages.map((p, idx) => {
      if (idx === 0) {
        return {
          ...p,
          text: p.text + `\n\n[Collaborative Annotation by ${pick.author.name} (${pick.author.role})]:\n"${pick.note}"`,
        };
      }
      return p;
    });

    const updatedSnapshot: DocumentSnapshot = {
      ...currentSnapshot,
      pages: updatedPages,
      annotations: updatedAnnotations,
    };

    const newVersion = this.recordCollaborativeChange(
      pdfId,
      updatedSnapshot,
      pick.author,
      pick.action,
      {
        annotationsAdded: 1,
        pagesModified: [1],
        textChangesCount: 1,
      }
    );

    return { newVersion, updatedSnapshot };
  }

  /**
   * Toggle milestone bookmark for a version.
   */
  public toggleMilestone(pdfId: string, versionId: string): DocumentVersion | null {
    const versions = [...this.getVersions(pdfId)];
    const targetIdx = versions.findIndex((v) => v.id === versionId);
    if (targetIdx === -1) return null;

    versions[targetIdx] = {
      ...versions[targetIdx],
      isMilestone: !versions[targetIdx].isMilestone,
    };

    this.persist(pdfId, versions);
    return versions[targetIdx];
  }

  /**
   * Delete a non-current version.
   */
  public deleteVersion(pdfId: string, versionId: string): boolean {
    const versions = this.getVersions(pdfId);
    const target = versions.find((v) => v.id === versionId);
    if (!target || target.isCurrent) return false;

    const remaining = versions.filter((v) => v.id !== versionId);
    this.persist(pdfId, remaining);
    return true;
  }
}

export const versionHistoryService = new VersionHistoryService();

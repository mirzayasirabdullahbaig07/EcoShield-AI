// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title EcoShield ActionRegistry
/// @notice Public, tamper-evident registry of APPROVED community climate-action records.
/// Stores only hashes and a public report ID. No personal data and no files go on-chain.
/// A registry entry proves the evidence and record were unchanged after approval. It does NOT prove the claim itself is true.
contract ActionRegistry {
    struct Record {
        bytes32 evidenceHash; // SHA-256 of the photo, or 0x0 when the report had no photo
        bytes32 recordHash;   // SHA-256 of the canonical record (id, category, area, text, evidence hash, created time)
        uint64 registeredAt;
        bool exists;
    }

    address public immutable registrar;
    mapping(bytes32 => Record) private records;

    event ActionRegistered(bytes32 indexed key, string recordId, bytes32 evidenceHash, bytes32 recordHash);

    constructor() {
        registrar = msg.sender;
    }

    /// @notice Register an approved record once. Reverts if the ID was registered before.
    function register(string calldata recordId, bytes32 evidenceHash, bytes32 recordHash) external {
        require(msg.sender == registrar, "Only registrar");
        require(bytes(recordId).length > 0 && bytes(recordId).length <= 64, "Bad record id");
        require(recordHash != bytes32(0), "Record hash required");
        bytes32 key = keccak256(bytes(recordId));
        require(!records[key].exists, "Already registered");
        records[key] = Record(evidenceHash, recordHash, uint64(block.timestamp), true);
        emit ActionRegistered(key, recordId, evidenceHash, recordHash);
    }

    /// @notice Read a record. `exists` is false for unknown IDs.
    function getRecord(string calldata recordId)
        external
        view
        returns (bytes32 evidenceHash, bytes32 recordHash, uint64 registeredAt, bool exists)
    {
        Record memory r = records[keccak256(bytes(recordId))];
        return (r.evidenceHash, r.recordHash, r.registeredAt, r.exists);
    }
}

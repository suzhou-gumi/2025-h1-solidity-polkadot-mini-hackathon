pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract VersionedDataNFT is ERC721URIStorage, Ownable {
    using Strings for uint256;
    using ECDSA for bytes32;

    struct VersionInfo {
        uint256 versionNumber;
        address uploader;
        uint256 timestamp;
        string data;
    }

    struct TokenData {
        uint256 currentVersion;
        bytes32 contentHash;
        uint256 createdAt;
        uint256 lastUpdatedAt;
        string contentType;
        uint256 dataSize;
        address[] allUploaders;
    }

    mapping(bytes32 => uint256) private _contentHashToTokenId;
    mapping(uint256 => TokenData) private _tokenData;
    mapping(uint256 => mapping(uint256 => VersionInfo)) private _versionHistory;
    mapping(address => uint256[]) private _uploaderTokens;

    uint256 private _nextTokenId;
    uint256 public constant MAX_DATA_LENGTH = 24576;

    event DataUploaded(
        uint256 indexed tokenId,
        address indexed uploader,
        uint256 version,
        bytes32 contentHash,
        string contentType,
        uint256 dataSize
    );

    event VersionIncremented(
        uint256 indexed tokenId,
        address indexed uploader,
        uint256 newVersion,
        bytes32 contentHash,
        string contentType,
        uint256 dataSize
    );

    constructor(address initialOwner)
        ERC721("Versioned Data NFT", "VDNFT")
        Ownable(initialOwner)
    {}

    function uploadData(
        string memory base64Data,
        string memory contentType
    ) public {
        require(bytes(base64Data).length > 0, "Empty data");
        require(bytes(base64Data).length <= MAX_DATA_LENGTH, "Data too large");
        require(bytes(contentType).length > 0, "Content type required");

        bytes32 contentHash = keccak256(abi.encodePacked(base64Data, contentType));
        uint256 existingTokenId = _contentHashToTokenId[contentHash];
        uint256 timestamp = block.timestamp;

        if (existingTokenId != 0) {
            if (!_isUploader(existingTokenId, _msgSender())) {
                _tokenData[existingTokenId].currentVersion++;
                _tokenData[existingTokenId].lastUpdatedAt = timestamp;
                _tokenData[existingTokenId].allUploaders.push(_msgSender());

                _versionHistory[existingTokenId][_tokenData[existingTokenId].currentVersion] = VersionInfo({
                    versionNumber: _tokenData[existingTokenId].currentVersion,
                    uploader: _msgSender(),
                    timestamp: timestamp,
                    data: _truncateDataForStorage(base64Data)
                });

                emit VersionIncremented(
                    existingTokenId,
                    _msgSender(),
                    _tokenData[existingTokenId].currentVersion,
                    contentHash,
                    contentType,
                    bytes(base64Data).length
                );

                _updateTokenURI(existingTokenId, base64Data, contentType);
            }
        } else {
            _nextTokenId++;
            uint256 newTokenId = _nextTokenId;

            _mint(_msgSender(), newTokenId);

            address[] memory uploaders = new address[](1);
            uploaders[0] = _msgSender();

            _tokenData[newTokenId] = TokenData({
                currentVersion: 1,
                contentHash: contentHash,
                createdAt: timestamp,
                lastUpdatedAt: timestamp,
                contentType: contentType,
                dataSize: bytes(base64Data).length,
                allUploaders: uploaders
            });

            _versionHistory[newTokenId][1] = VersionInfo({
                versionNumber: 1,
                uploader: _msgSender(),
                timestamp: timestamp,
                data: _truncateDataForStorage(base64Data)
            });

            _contentHashToTokenId[contentHash] = newTokenId;
            _uploaderTokens[_msgSender()].push(newTokenId);

            _updateTokenURI(newTokenId, base64Data, contentType);

            emit DataUploaded(
                newTokenId,
                _msgSender(),
                1,
                contentHash,
                contentType,
                bytes(base64Data).length
            );
        }
    }

    function getTokenVersion(uint256 tokenId) public view returns (uint256) {
        _requireOwned(tokenId);
        return _tokenData[tokenId].currentVersion;
    }

    function getTokenInfo(uint256 tokenId) public view returns (
        uint256 version,
        bytes32 contentHash,
        uint256 createdAt,
        uint256 lastUpdatedAt,
        string memory contentType,
        uint256 dataSize,
        address[] memory allUploaders
    ) {
        _requireOwned(tokenId);
        TokenData storage data = _tokenData[tokenId];
        return (
            data.currentVersion,
            data.contentHash,
            data.createdAt,
            data.lastUpdatedAt,
            data.contentType,
            data.dataSize,
            data.allUploaders
        );
    }

    function getVersionHistory(uint256 tokenId, uint256 version) public view returns (
        uint256 versionNumber,
        address uploader,
        uint256 timestamp,
        string memory dataPreview
    ) {
        _requireOwned(tokenId);
        VersionInfo storage info = _versionHistory[tokenId][version];
        require(info.versionNumber != 0, "Version does not exist");

        return (
            info.versionNumber,
            info.uploader,
            info.timestamp,
            info.data
        );
    }

    function getTokensByUploader(address uploader) public view returns (uint256[] memory) {
        return _uploaderTokens[uploader];
    }

    function isUploader(uint256 tokenId, address uploader) public view returns (bool) {
        return _isUploader(tokenId, uploader);
    }

    function _updateTokenURI(
        uint256 tokenId,
        string memory base64Data,
        string memory contentType
    ) internal {
        string memory dataURI = string(abi.encodePacked(
            "data:",
            contentType,
            ";base64,",
            base64Data
        ));

        string memory json = Base64.encode(bytes(string(abi.encodePacked(
            '{"name":"Versioned Data NFT #', tokenId.toString(),
            '","description":"A versioned data NFT storing ', _getContentTypeName(contentType), ' data.",',
            '"version":', _tokenData[tokenId].currentVersion.toString(),
            ',"created_at":', _tokenData[tokenId].createdAt.toString(),
            ',"last_updated":', _tokenData[tokenId].lastUpdatedAt.toString(),
            ',"content_type":"', contentType,
            '","data_size":', _tokenData[tokenId].dataSize.toString(),
            ',"data_uri":"', dataURI,
            '"}'
        ))));

        _setTokenURI(tokenId, string(abi.encodePacked("data:application/json;base64,", json)));
    }

    function _isUploader(uint256 tokenId, address uploader) internal view returns (bool) {
        for (uint256 i = 0; i < _tokenData[tokenId].allUploaders.length; i++) {
            if (_tokenData[tokenId].allUploaders[i] == uploader) {
                return true;
            }
        }
        return false;
    }

    function _truncateDataForStorage(string memory data) internal pure returns (string memory) {
        bytes memory dataBytes = bytes(data);
        if (dataBytes.length <= 128) {
            return data;
        }

        bytes memory result = new bytes(132);
        for (uint256 i = 0; i < 64; i++) {
            result[i] = dataBytes[i];
            result[68 + i] = dataBytes[dataBytes.length - 64 + i];
        }

        result[64] = ".";
        result[65] = ".";
        result[66] = ".";
        result[67] = ".";

        return string(result);
    }

    function _getContentTypeName(string memory contentType) internal pure returns (string memory) {
        bytes memory contentTypeBytes = bytes(contentType);
        bytes memory result = new bytes(contentTypeBytes.length);
        bool capitalizeNext = true;

        for (uint256 i = 0; i < contentTypeBytes.length; i++) {
            bytes1 char = contentTypeBytes[i];

            if (char == "/") {
                result[i] = " ";
                capitalizeNext = true;
            } else if (capitalizeNext && char >= 0x61 && char <= 0x7A) {
                result[i] = bytes1(uint8(char) - 32);
                capitalizeNext = false;
            } else {
                result[i] = char;
                capitalizeNext = false;
            }
        }

        return string(result);
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        require(to != address(0), "ERC721: transfer to the zero address");
        return super._update(to, tokenId, auth);
    }
}
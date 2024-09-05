## Foundry

# Deploy contract 
| forge create Prism --rpc-url opencampuscodex --private-key=private_Key --constructor-args "0x2Baffb43dcD57907dD6408E1afB8b7b09548bCcc"

# Verify Deployed Contract
 forge verify-contract \
              --rpc-url https://rpc.open-campus-codex.gelato.digital \
              --verifier blockscout \
              --verifier-url 'https://opencampus-codex.blockscout.com/api/' \
              {contract_address} \
            --compiler-version v0.8.26 \
              src/Prism.sol:Prism
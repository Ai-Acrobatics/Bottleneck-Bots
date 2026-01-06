#!/usr/bin/env expect

set timeout 300
spawn env NODE_TLS_REJECT_UNAUTHORIZED=0 npx drizzle-kit push

# Auto-select first option (create table) for all prompts
while {1} {
    expect {
        "create table" {
            send "\r"
        }
        "rename table" {
            # Skip rename options, select create
            send "\r"
        }
        "Is * table created or renamed" {
            send "\r"
        }
        "Push complete" {
            break
        }
        "Changes applied" {
            break
        }
        eof {
            break
        }
        timeout {
            break
        }
    }
}
